/**
 * Resumable Stream Service
 * Enables resume capability for AI chat streams using Redis persistence
 * and cross-process stop signaling via pub/sub
 */

import { createResumableUIMessageStream } from "ai-resumable-stream";
import { createClient } from "redis";
import { getCircuitBreaker } from "@/services/circuit-breaker.service";
import Groq from "groq-sdk";
import { Stream } from "groq-sdk/core/streaming";
import { aiConfig } from "@/lib/config";

// Redis configuration - use redis package for ai-resumable-stream compatibility
function createRedisClient() {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    console.warn("REDIS_URL not set, using localhost");
    return createClient({ url: "redis://localhost:6379" });
  }

  return createClient({ url: redisUrl });
}

// Singleton Redis clients for resumable streams
// These persist across serverless invocations in the same warm container
const globalForResumable = global as unknown as {
  resumableRedis: ReturnType<typeof createClient>;
  resumableRedisSub: ReturnType<typeof createClient>;
  resumableStreamInstances: Map<string, Awaited<ReturnType<typeof createResumableUIMessageStream>>>;
};

if (!globalForResumable.resumableRedis) {
  globalForResumable.resumableRedis = createRedisClient();
  globalForResumable.resumableRedisSub = createRedisClient();
  globalForResumable.resumableStreamInstances = new Map();
}

const redisResumable = globalForResumable.resumableRedis;
const redisResumableSub = globalForResumable.resumableRedisSub;
const resumableStreamInstances = globalForResumable.resumableStreamInstances;

// Groq instance
const groq = new Groq();
const groqBreaker = getCircuitBreaker("groq");

// Map to hold abort controllers per chat
const streamAbortControllers = new Map<string, AbortController>();

// Set to track active stream IDs for deduplication
const activeStreamIds = new Set<string>();

/**
 * Create a resumable stream ID for a chat
 */
export function getStreamId(chatId: string): string {
  return `chat:${chatId}:stream`;
}

/**
 * Get or create a resumable stream instance for a chat
 * Instance is reused for the lifetime of the serverless warm container
 */
async function getResumableStreamInstance(chatId: string) {
  const streamId = getStreamId(chatId);

  if (resumableStreamInstances.has(streamId)) {
    return resumableStreamInstances.get(streamId)!;
  }

  const instance = await createResumableUIMessageStream({
    subscriber: redisResumable,
    publisher: redisResumableSub,
    streamId,
  });

  resumableStreamInstances.set(streamId, instance);
  return instance;
}

/**
 * Cleanup function to call when stream ends
 */
function cleanupStream(chatId: string) {
  const streamId = getStreamId(chatId);

  // Remove abort controller
  const abortController = streamAbortControllers.get(chatId);
  if (abortController) {
    abortController.abort();
    streamAbortControllers.delete(chatId);
  }

  // Remove from active streams
  activeStreamIds.delete(streamId);

  // Note: We don't remove from resumableStreamInstances Map
  // because the instance is tied to the streamId and can be reused
  // The library handles cleanup internally via Redis TTL
}

/**
 * Start a new resumable stream for AI response
 */
export async function startResumableStream(
  chatId: string,
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  onChunk?: (content: string, isResume: boolean) => void,
  onComplete?: (fullContent: string, isResume: boolean) => void,
  onError?: (error: Error, isResume: boolean) => void
): Promise<{
  stream: ReadableStream;
  stop: () => void;
}> {
  const streamId = getStreamId(chatId);

  // Check if stream already active (prevents duplicate streams)
  if (activeStreamIds.has(streamId)) {
    console.warn(`[ResumableStream] Stream already active for ${streamId}`);
    // Return a dummy stream that immediately closes
    return {
      stream: new ReadableStream({ start(c) { c.close(); } }),
      stop: () => cleanupStream(chatId),
    };
  }

  // Create abort controller for this stream
  const abortController = new AbortController();
  streamAbortControllers.set(chatId, abortController);
  activeStreamIds.add(streamId);

  // Get resumable stream instance
  const { startStream, stopStream: broadcastStop } = await getResumableStreamInstance(chatId);

  let fullContent = "";
  let streamEnded = false;

  // Create the AI stream with proper error handling
  let aiStream: Stream<any>;
  try {
    aiStream = await groqBreaker.execute(() =>
      groq.chat.completions.create({
        model: aiConfig.model,
        messages: messages as any,
        stream: true,
        temperature: aiConfig.temperature,
        max_tokens: aiConfig.maxTokens,
      } as any)
    ) as unknown as Stream<any>;
  } catch (error) {
    cleanupStream(chatId);
    throw error;
  }

  // Convert AI SDK stream to a ReadableStream
  const readableStream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      (async () => {
        try {
          for await (const chunk of aiStream!) {
            if (abortController.signal.aborted || streamEnded) break;

            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              fullContent += content;
              onChunk?.(content, false);
              controller.enqueue(
                encoder.encode(JSON.stringify({ content }) + "\n\n")
              );
            }
          }
        } catch (error) {
          if (!abortController.signal.aborted && !streamEnded) {
            const err = error instanceof Error ? error : new Error(String(error));
            onError?.(err, false);
            controller.error(err);
            return;
          }
        } finally {
          if (!streamEnded) {
            streamEnded = true;
            cleanupStream(chatId);
          }
        }

        // Ensure close is called only once
        try {
          controller.close();
        } catch {
          // Already closed
        }
      })();
    },
    cancel() {
      abortController.abort();
    },
  });

  // Wrap with resumable stream
  let wrappedStream;
  try {
    wrappedStream = await startStream(readableStream, {
      keepAlive: Promise.resolve(),
      onFlush: () => {
        console.log(`[ResumableStream] Stream ${streamId} flush complete`);
        // onComplete is called here for post-flush operations
        if (fullContent) {
          onComplete?.(fullContent, false);
        }
      },
    });
  } catch (error) {
    cleanupStream(chatId);
    throw error;
  }

  return {
    stream: wrappedStream,
    stop: () => {
      abortController.abort();
      broadcastStop();
      cleanupStream(chatId);
    },
  };
}

/**
 * Resume an existing stream
 */
export async function resumeResumableStream(
  chatId: string,
  onChunk?: (content: string, isResume: boolean) => void,
  onComplete?: (fullContent: string, isResume: boolean) => void,
  onError?: (error: Error, isResume: boolean) => void
): Promise<{
  stream: ReadableStream;
  stop: () => void;
  isNew: boolean;
  hasExisting: boolean;
} | null> {
  const streamId = getStreamId(chatId);

  // If stream is currently active, don't try to resume
  // Just return null and let the active stream continue
  if (activeStreamIds.has(streamId)) {
    console.log(`[ResumableStream] Stream already active for ${streamId}`);
    return null;
  }

  // Create abort controller for resumed stream
  const abortController = new AbortController();
  streamAbortControllers.set(chatId, abortController);
  activeStreamIds.add(streamId);

  try {
    const { resumeStream, stopStream: broadcastStop } = await getResumableStreamInstance(chatId);

    const resumedStream = await resumeStream();

    if (!resumedStream) {
      cleanupStream(chatId);
      return null;
    }

    let fullContent = "";

    // Convert the resumed stream to ReadableStream
    const readableStream = new ReadableStream({
      start(controller) {
        (async () => {
          try {
            for await (const chunk of resumedStream) {
              if (abortController.signal.aborted) break;

              // Handle UI message chunk format from ai-resumable-stream
              const content = (chunk as { delta?: string }).delta || (chunk as { content?: string }).content;
              if (content) {
                fullContent += content;
                onChunk?.(content, true); // isResume = true
                controller.enqueue(
                  new TextEncoder().encode(JSON.stringify(chunk) + "\n\n")
                );
              }
            }
          } catch (error) {
            if (!abortController.signal.aborted) {
              const err = error instanceof Error ? error : new Error(String(error));
              onError?.(err, true);
              controller.error(err);
              return;
            }
          } finally {
            cleanupStream(chatId);
          }

          try {
            controller.close();
          } catch {
            // Already closed
          }
        })();
      },
      cancel() {
        abortController.abort();
      },
    });

    return {
      stream: readableStream,
      stop: () => {
        abortController.abort();
        broadcastStop();
        cleanupStream(chatId);
      },
      isNew: false,
      hasExisting: true,
    };
  } catch (error) {
    cleanupStream(chatId);

    // Stream not found or expired - this is expected, not an error
    if ((error as Error).message?.includes("not found") ||
        (error as Error).message?.includes("expired") ||
        (error as Error).message?.includes("no existing stream")) {
      console.log(`[ResumableStream] No existing stream for ${streamId}`);
      return null;
    }

    // Real error
    throw error;
  }
}

/**
 * Stop a running stream (broadcasts to all processes)
 */
export async function stopResumableStream(chatId: string): Promise<void> {
  const streamId = getStreamId(chatId);

  // Stop locally
  cleanupStream(chatId);

  // Broadcast stop to all processes
  try {
    const { stopStream: broadcastStop } = await getResumableStreamInstance(chatId);
    await broadcastStop();
  } catch (error) {
    console.error("[ResumableStream] Failed to broadcast stop:", error);
  }
}

/**
 * Check if a stream is currently active
 */
export function isStreamActive(chatId: string): boolean {
  return activeStreamIds.has(getStreamId(chatId));
}

/**
 * Get all active stream IDs (for debugging/monitoring)
 */
export function getActiveStreams(): string[] {
  return Array.from(activeStreamIds);
}
