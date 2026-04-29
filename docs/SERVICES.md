# Services Architecture

## Overview

Business logic is centralized in `services/`. API routes are thin HTTP wrappers that delegate to services. This separation enables:
- Reusable business logic across API routes
- Easier testing (mock services, not HTTP)
- Cleaner code organization

## Service Files

```
services/
├── chat.service.ts              # Chat CRUD, branching, message ops
├── credit.service.ts            # Credit balance, deduction, refunds
├── limit.service.ts              # Plan limits checking
├── plan.service.ts              # Plan data access
├── memory.service.ts             # User memory operations
├── summarize.service.ts          # Hierarchical context summarization
├── rate-limit.service.ts        # Rate limiting logic
├── resumable-stream.service.ts   # SSE streaming with resume support
├── resumable-pubsub.service.ts   # Cross-container stream tracking
├── resume-queue.service.ts       # Resume retry queue
├── chat-pubsub.service.ts        # Chat real-time notifications
├── mcp-tools.service.ts         # MCP tool discovery
├── mcp-tool-executor.service.ts  # MCP tool execution
├── rag.service.ts                # RAG context retrieval
├── embedding.service.ts         # Text embeddings
├── push-notification.service.ts  # Web push notifications
├── queue.service.ts              # BullMQ job queue
├── workers.ts                    # Background job processors
│
├── admin/
│   ├── audit-log.service.ts     # Audit event logging
│   ├── inbox.service.ts         # Admin inbox
│   └── stats.service.ts         # Aggregated stats
│
└── [feature].service.ts
```

---

## Chat Service

**File:** `services/chat.service.ts`

### Core Functions

```typescript
// Chat list with cursor pagination
async function getUserChats(
  userId: string,
  limit = 20,
  cursor?: string,
  options: { archived?: boolean; projectId?: string } = {}
): Promise<{ chats: Chat[]; nextCursor: string | null }>

// Search chats
async function searchUserChats(
  userId: string,
  query: string,
  limit = 20
): Promise<{ chats: Chat[]; nextCursor: null }>

// Create chat
async function createChat(
  userId: string,
  options: { projectId?: string; firstMessage?: string } = {}
): Promise<Chat>

// Get chat by ID
async function getChatById(chatId: string, userId: string): Promise<Chat | null>

// Update chat (title, archive, pin, project)
async function updateChat(
  chatId: string,
  userId: string,
  data: { title?: string; archivedAt?: Date | null; projectId?: string | null; pinnedAt?: Date | null }
): Promise<Chat>

// Delete chat
async function deleteChat(chatId: string, userId: string): Promise<void>

// Get messages with bidirectional pagination
async function getChatMessages(
  chatId: string,
  userId: string,
  limit = 50,
  cursor?: string,
  direction: "before" | "after" = "before"
): Promise<{ messages: Message[]; nextCursor: string | null; prevCursor: string | null }>

// Add message
async function addChatMessage(
  chatId: string,
  userId: string,
  data: { role: "user" | "assistant"; content: string }
): Promise<Message>

// Get recent messages for AI context
async function getRecentMessages(chatId: string, limit = 20): Promise<Message[]>
```

### Caching

```typescript
// Chat list: 5 min TTL
await redis.setex(KEYS.userChats(userId), TTL.userChats, JSON.stringify(chats));

// Chat metadata: hash stored in Redis
await redis.hset(KEYS.chatMeta(chatId), {
  title: chat.title,
  createdAt: chat.createdAt.toISOString(),
  projectId: chat.projectId || "",
});

// Chat messages: list with 1 hour TTL
await redis.lpush(KEYS.chatMessages(chatId), JSON.stringify(message));
await redis.ltrim(KEYS.chatMessages(chatId), 0, 99); // Keep last 100
```

### Pub/Sub Events

```typescript
// Published when chat state changes
await redis.publish(
  CHANNELS.sidebar(userId),
  JSON.stringify({
    type: "chat:created" | "chat:archived" | "chat:pinned" | "chat:renamed" | "chat:deleted",
    chatId: chat.id,
    title: chat.title,
  })
);
```

---

## Credit Service

**File:** `services/credit.service.ts`

### Core Functions

```typescript
// Get current balance
async function getUserCredits(userId: string): Promise<number>

// Deduct credits for operation
async function deductCredits(
  userId: string,
  operation: CreditOperation,
  customAmount?: number
): Promise<{ success: boolean; deducted?: number; remainingCredits?: number; error?: string }>

// Add credits
async function addCredits(userId: string, amount: number): Promise<{ success: boolean; newBalance: number }>

// Check if user can afford operation
async function checkCreditsForOperation(userId: string, operation: CreditOperation): Promise<boolean>

// Proportional refund for partial stream
async function refundProportional(
  userId: string,
  streamedBytes: number,
  totalBytes: number,
  operation: CreditOperation
): Promise<{ success: boolean; refunded: number }>
```

### Credit Operations & Costs

```typescript
type CreditOperation = "eryx-fast" | "eryx-pro" | "web-search" | "file-analysis" | "image-generation";

const CREDIT_COSTS = {
  "eryx-fast": 1,
  "eryx-pro": 5,
  "web-search": 3,
  "file-analysis": 5,
  "image-generation": 20,
};
```

### Deduction Flow

```typescript
async function deductCredits(userId, operation, customAmount?) {
  const cost = customAmount ?? CREDIT_COSTS[operation] ?? 1;
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if ((user.credits || 0) < cost) {
    return { success: false, error: "Insufficient credits" };
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { credits: { decrement: cost } },
  });

  // Auto-downgrade to free if credits exhausted
  if (updatedUser.credits === 0 && user.planTier !== "FREE") {
    await downgradeToFreePlan(userId);
  }

  return { success: true, deducted: cost, remainingCredits: updatedUser.credits };
}
```

---

## Limit Service

**File:** `services/limit.service.ts`

### UserLimits Interface

```typescript
interface UserLimits {
  maxMemoryItems: number;
  maxBranchesPerChat: number;
  maxFolders: number;
  maxAttachmentsPerChat: number;
  maxFileSizeMb: number;
  canExport: boolean;
  canApiAccess: boolean;
  hasFeature: (feature: string) => boolean;
  planName: string;
  planTier: PlanTier;
  maxProjects: number;
  maxChats: number;
  maxMessages: number;
}
```

### Limit Check Functions

```typescript
// Get full limits (cached 5 min)
async function getUserLimits(userId: string): Promise<UserLimits>

// Invalidate cache on plan change
async function invalidateUserLimitsCache(userId: string): Promise<void>

// Individual limit checks
async function checkChatLimit(userId: string): Promise<LimitCheckResult>
async function checkProjectLimit(userId: string): Promise<LimitCheckResult>
async function checkMemoryLimit(userId: string): Promise<LimitCheckResult>
async function checkBranchLimit(userId: string, chatId: string): Promise<LimitCheckResult>
async function checkFolderLimit(userId: string): Promise<LimitCheckResult>
async function checkAttachmentLimit(userId: string, chatId: string): Promise<LimitCheckResult>
async function checkExportLimit(userId: string): Promise<LimitCheckResult>
async function checkApiAccessLimit(userId: string): Promise<LimitCheckResult>
async function checkFileSizeLimit(userId: string, fileSizeMb: number): Promise<LimitCheckResult>
```

### LimitCheckResult

```typescript
interface LimitCheckResult {
  allowed: boolean;
  current?: number;
  limit?: number;
  error?: string;
  upgradeTo?: PlanTier;
}
```

---

## Memory Service

**File:** `services/memory.service.ts`

```typescript
async function getUserMemories(userId: string): Promise<Memory[]>
async function getMemoriesByCategory(userId: string, category: string): Promise<Memory[]>
async function createMemory(userId: string, data: CreateMemoryInput): Promise<Memory>
async function updateMemory(memoryId: string, userId: string, data: UpdateMemoryInput): Promise<Memory>
async function deleteMemory(memoryId: string, userId: string): Promise<void>
async function searchMemories(userId: string, query: string): Promise<Memory[]>
```

**Redis caching:** 5 minute TTL on list operations.

---

## Summarize Service

**File:** `services/summarize.service.ts`

Handles hierarchical context management for long conversations.

### Why Summarize?

When a chat has 50+ messages, sending all to the LLM exceeds token budgets. Instead of raw truncation:
1. Generate structured summary via LLM after every 50 messages
2. Store summary in PostgreSQL + Redis cache
3. Use summary + recent messages for context

### Core Functions

```typescript
// Get smart context - summary + recent messages
async function getChatContext(
  chatId: string,
  options: { maxTokens?: number }
): Promise<{
  messages: Message[];
  summary?: string;
  topics?: string[];
  keyFacts?: string[];
  truncated: boolean;
}>

// Check if chat needs summarization
async function shouldSummarize(chatId: string): Promise<boolean>

// Async trigger for summarization (fire-and-forget)
async function queueSummarization(chatId: string): Promise<void>

// Perform LLM summarization
async function summarizeChat(chatId: string): Promise<boolean>

// Delete summary when chat deleted
async function deleteSummary(chatId: string): Promise<void>
```

### Summary Data Structure

```typescript
interface ChatSummary {
  summary: string;        // "User discussed auth setup, chose NextAuth..."
  topics: string[];       // ["authentication", "NextAuth", "JWT"]
  keyFacts: string[];     // ["import prisma from '@/lib/prisma'", "API: /api/chat"]
  startMessageId: string;  // First message in summary
  endMessageId: string;   // Last message in summary
  messageCount: number;    // Messages summarized
  tokenCount: number;     // Token cost
}
```

### Redis Keys

```
chat:{chatId}:summary     → Cached summary (7 day TTL)
chat:{chatId}:summarizing → Lock to prevent duplicate summarization (5 min TTL)
```

---

## Resumable Stream Service

**File:** `services/resumable-stream.service.ts`

Enables AI response streaming with resume capability.

### Core Functions

```typescript
// Start new stream (stops existing if active)
async function startResumableStream(
  chatId: string,
  messages: Message[],
  options: StreamOptions,
  callbacks: { onChunk, onComplete, onError }
): Promise<void>

// Resume from Redis
async function resumeResumableStream(
  chatId: string,
  callbacks: { onChunk, onComplete, onError }
): Promise<boolean>

// Broadcast stop to all processes
async function stopResumableStream(chatId: string): Promise<void>

// Check if stream active
async function isStreamActive(chatId: string): Promise<boolean>

// Get all active streams across containers
async function getAllActiveStreamsCrossContainer(): Promise<string[]>
```

### Features

- **Chunk storage**: Redis stores chunks as they arrive
- **Stop signal**: Redis pub/sub broadcasts abort across all containers
- **Partial refund**: Tracks content length for proportional refunds
- **Cross-container detection**: Redis Set tracks active streams globally
- **Resume queue**: BullMQ retries failed resume attempts
- **Chunk compression**: GZIP for large responses

### Redis Keys

```
ai-resumable-stream:stream:chat:{chatId}:stream  → Chunk data
ai-resumable-stream:stop:chat:{chatId}:stream   → Stop signal channel
chat:{chatId}:partial                           → Partial refund data (24h TTL)
active:streams                                   → Set of active stream IDs
resume:{chatId}:ready                           → Resume ready signal (5m TTL)
```

---

## MCP Tools Service

**File:** `services/mcp-tools.service.ts`

### Core Functions

```typescript
// Load tools from all user's enabled MCP servers
async function getMCPToolsForChat(userId: string): Promise<McpToolDefinition[]>

// Test MCP server connection
async function testMcpServer(
  url: string,
  transportType: "http" | "sse",
  authHeaders?: Record<string, string>
): Promise<{ ok: boolean; toolCount: number; toolNames: string[] }>

// Format tools for OpenAI schema
function formatMCPToolsForOpenAI(tools: McpToolDefinition[]): OpenAITool[]
```

### Tool Naming

Tools are prefixed with server slug to avoid collisions:

```
Server: "GitHub Copilot" → slug: "github_copilot"
Tool: "pullRequests"   → full name: "mcp_github_copilot_pullRequests"
```

---

## MCP Tool Executor Service

**File:** `services/mcp-tool-executor.service.ts`

### Core Functions

```typescript
// Execute MCP tool call
async function executeMCPToolCall(
  toolCall: { id: string; name: string; arguments: Record<string, unknown> },
  userId: string
): Promise<{ id: string; result: unknown }>

// Parse prefixed tool name
function parsePrefixedToolName(prefixedName: string): { serverSlug: string; originalName: string }
```

### OAuth Token Auto-Refresh

Every tool call checks token expiry and auto-refreshes:

```typescript
async function getMcpAuthHeaders(server, userId) {
  if (tokenExpiresAt > Date.now() + 60_000) {
    return { Authorization: `Bearer ${accessToken}` };
  }

  // Token expired, refresh
  const newTokens = await refreshAccessToken({ ... });
  await prisma.mcpUserServer.update({ where: { id: server.id, userId }, data: { ... }});

  return { Authorization: `Bearer ${newTokens.accessToken}` };
}
```

---

## RAG Service

**File:** `services/rag.service.ts`

Retrieval-Augmented Generation for context injection.

### Core Functions

```typescript
// Retrieve relevant context for a query
async function retrieveContext(
  query: string,
  options: { userId?: string; fileIds?: string[]; maxTokens?: number }
): Promise<RagContext[]>

// Embed text for similarity search
async function embedText(text: string): Promise<number[]>
```

### Context Types

```typescript
interface RagContext {
  type: "memory" | "file" | "project";
  id: string;
  title: string;
  content: string;
  relevance: number;
  metadata?: Record<string, unknown>;
}
```

---

## Rate Limit Service

**File:** `services/rate-limit.service.ts`

### Rate Limit Tiers

```typescript
const RATE_LIMITS = {
  default: { windowMs: 60000, maxRequests: 100 },   // 100/min
  auth:    { windowMs: 300000, maxRequests: 10 },  // 10/5min
  chat:    { windowMs: 60000, maxRequests: 60 },   // 60/min
  search:  { windowMs: 60000, maxRequests: 30 },   // 30/min
};
```

### Core Functions

```typescript
async function rateLimit(
  request: NextRequest,
  limitType: keyof typeof RATE_LIMITS = "default"
): Promise<{ success: boolean; remaining: number; resetAt: number }>

function rateLimitResponse(resetAt: number): NextResponse
```

---

## Queue Service

**File:** `services/queue.service.ts`

BullMQ-backed job queue for async processing.

### Queues

| Queue | Purpose | Concurrency | Retry |
|-------|---------|-------------|-------|
| `webhook` | Polar webhooks | 5 | 5x exponential |
| `summarization` | Chat summarization | 2 | 3x exponential |
| `file-processing` | Post-upload processing | 3 | 3x exponential |
| `email` | Transactional emails | 5 | 3x exponential |
| `resume` | Resume retry attempts | 3 | 3x exponential |

### Core Functions

```typescript
// Add job to queue
async function queueJob(queueName: string, data: JobData, options?: QueueOptions): Promise<string>

// Email-specific
async function queueEmail(to: string, template: EmailTemplate, data: Record<string, unknown>): Promise<void>

// Resume-specific
async function queueResumeAttempt(chatId: string, userId: string, reason: string): Promise<void>
```

---

## Service Layer Conventions

### 1. Always Include userId in Where Clauses

```typescript
// WRONG - security hole
await prisma.mcpUserServer.update({ where: { id: serverId }, data: {} });

// CORRECT - userId verified
await prisma.mcpUserServer.update({ where: { id: serverId, userId }, data: {} });
```

### 2. Cache-Aside Pattern

```typescript
async function getCachedData(userId: string) {
  const cacheKey = KEYS.userCache(userId);

  try {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch { /* Redis down */ }

  const data = await prisma.user.findUnique({ where: { id: userId } });

  try {
    await redis.setex(cacheKey, TTL.userCache, JSON.stringify(data));
  } catch { /* Cache failed */ }

  return data;
}
```

### 3. Transaction for Atomic Operations

```typescript
const chat = await prisma.$transaction(async (tx) => {
  const user = await tx.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const newChat = await tx.chat.create({ data: { title, userId, projectId } });

  if (firstMessage) {
    await tx.message.create({ data: { chatId: newChat.id, ... } });
  }

  return newChat;
});
```

### 4. Invalidate Cache on Mutation

```typescript
async function updateUser(userId: string, data: UpdateUserData) {
  const updated = await prisma.user.update({ where: { id: userId }, data });

  // Invalidate caches
  await redis.del(KEYS.userCache(stackId));
  await redis.del(KEYS.userLimits(userId));

  return updated;
}
```

### 5. Fire-and-Forget for Non-Critical Operations

```typescript
// Trigger async summarization without blocking response
queueSummarization(chatId).catch(console.error);

// Audit logging
logAuditEvent({ type: "chat.created", userId, chatId }).catch(console.error);
```
