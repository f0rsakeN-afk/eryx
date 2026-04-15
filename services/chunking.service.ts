/**
 * Chunking Service
 * Semantic chunking for RAG - preserves document structure
 * Target ~500 tokens per chunk with overlap for context continuity
 */

const CHARS_PER_TOKEN = 4;
const TARGET_TOKENS = 500;
const TARGET_CHARS = TARGET_TOKENS * CHARS_PER_TOKEN; // 2000 chars
const OVERLAP_CHARS = 200; // 50 tokens overlap

export interface Chunk {
  content: string;
  tokenCount: number;
  chunkIndex: number;
}

/**
 * Semantic chunking - splits by paragraphs/sentences, not fixed size
 */
export function semanticChunk(text: string): Chunk[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const chunks: Chunk[] = [];

  // Split into paragraphs (double newline or single newline for dense text)
  const paragraphs = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  let currentChunk = "";
  let currentTokens = 0;
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    const paragraphTokens = estimateTokens(paragraph);

    // If single paragraph is too large, split it further
    if (paragraphTokens > TARGET_TOKENS * 1.5) {
      // Flush current chunk if it has content
      if (currentChunk.length > 0) {
        chunks.push(createChunk(currentChunk, chunkIndex));
        chunkIndex++;
        // Start new chunk with overlap
        currentChunk = getLastNChars(currentChunk, OVERLAP_CHARS);
        currentTokens = estimateTokens(currentChunk);
      }

      // Split long paragraph by sentences
      const sentenceChunks = splitBySentences(paragraph);
      for (const sentenceChunk of sentenceChunks) {
        const sentenceTokens = estimateTokens(sentenceChunk);

        if (currentTokens + sentenceTokens > TARGET_TOKENS && currentChunk.length > 0) {
          chunks.push(createChunk(currentChunk, chunkIndex));
          chunkIndex++;
          currentChunk = getLastNChars(currentChunk, OVERLAP_CHARS);
          currentTokens = estimateTokens(currentChunk);
        }

        currentChunk += (currentChunk.length > 0 ? "\n\n" : "") + sentenceChunk;
        currentTokens += sentenceTokens;
      }
    } else {
      // Normal paragraph - check if it fits in current chunk
      if (currentTokens + paragraphTokens > TARGET_TOKENS && currentChunk.length > 0) {
        // Save current chunk and start new one
        chunks.push(createChunk(currentChunk, chunkIndex));
        chunkIndex++;

        // Start new chunk with overlap from previous chunk's tail
        currentChunk = getLastNChars(currentChunk, OVERLAP_CHARS);
        currentTokens = estimateTokens(currentChunk);
      }

      // Add paragraph to current chunk
      currentChunk += (currentChunk.length > 0 ? "\n\n" : "") + paragraph;
      currentTokens += paragraphTokens;
    }
  }

  // Don't forget the last chunk
  if (currentChunk.length > 0) {
    chunks.push(createChunk(currentChunk, chunkIndex));
  }

  return chunks;
}

/**
 * Split text by sentences (simple approach)
 */
function splitBySentences(text: string): string[] {
  // Match sentence endings: . ! ? followed by space or end
  const sentenceRegex = /[^.!?]*[.!?]+(?:\s|$)+/g;
  const matches = text.match(sentenceRegex) || [text];

  // If regex didn't match well, return whole text as single chunk
  if (matches.length === 1 && matches[0] === text) {
    // Split by commas or semicolons as fallback for dense text
    const fallback = text.split(/[,;]+/).filter(s => s.trim().length > 50);
    return fallback.length > 1 ? fallback : [text];
  }

  return matches;
}

/**
 * Create a chunk object with metadata
 */
function createChunk(content: string, chunkIndex: number): Chunk {
  return {
    content: content.trim(),
    tokenCount: estimateTokens(content),
    chunkIndex,
  };
}

/**
 * Get last N characters from text (for overlap)
 */
function getLastNChars(text: string, n: number): string {
  if (text.length <= n) return text;
  return text.slice(-n);
}

/**
 * Estimate tokens from text
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * Get total tokens for all chunks
 */
export function getTotalChunkTokens(chunks: Chunk[]): number {
  return chunks.reduce((sum, chunk) => sum + chunk.tokenCount, 0);
}
