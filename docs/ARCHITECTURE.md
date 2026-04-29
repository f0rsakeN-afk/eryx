# Eryx Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              Clients                                      │
│   Web Browser (React)                    Mobile (Future PWA)            │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Next.js App Router                               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────────────┐ │
│  │  Pages     │  │ API Routes │  │ Middleware │  │  Route Groups       │ │
│  │ (React)    │  │  (REST)    │  │ (Security) │  │ (main/marketing/   │ │
│  │            │  │            │  │            │  │  plain/admin)      │ │
│  └────────────┘  └────────────┘  └────────────┘  └────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
┌───────────────┐         ┌───────────────┐          ┌───────────────┐
│   Services    │         │  AI Provider  │          │   External    │
│ (Business     │         │   (OpenAI)    │          │   Services    │
│  Logic)       │         │               │          │               │
│               │         │               │          │               │
│ - chat        │         │               │          │ - Polar       │
│ - credit      │         │               │          │ - SearxNG     │
│ - limit       │         │               │          │ - MCP Servers │
│ - plan        │         │               │          │ - Stack Auth  │
│ - memory      │         │               │          │ - S3          │
│ - mcp-tools   │         │               │          │               │
│ - summarize   │         │               │          │               │
│ - rate-limit  │         │               │          │               │
└───────┬───────┘         └───────────────┘          └───────────────┘
        │
        ▼
┌───────────────┐         ┌───────────────┐
│    Redis     │         │  PostgreSQL   │
│ (Cache/      │         │  (Prisma ORM) │
│  PubSub)     │         │               │
│              │         │               │
└───────────────┘         └───────────────┘
```

---

## Directory Structure

```
eryx/
├── app/                          # Next.js 16 App Router
│   ├── (main)/                   # Authenticated app routes
│   │   ├── chat/                 # Chat interface
│   │   ├── projects/             # Project management
│   │   ├── memory/               # Memory/notes
│   │   ├── apps/                 # MCP apps catalog
│   │   └── settings/             # User settings
│   ├── (marketing)/              # Public marketing pages
│   ├── (plain)/                  # Unauthenticated pages
│   ├── admin/                    # Admin panel
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── chats/
│   │   ├── plans/
│   │   └── settings/
│   ├── api/                      # API routes
│   │   ├── chat/                 # Streaming chat endpoint
│   │   ├── chats/                # Chat CRUD
│   │   ├── search/               # Web search
│   │   ├── memory/               # Memory operations
│   │   ├── polar/                # Payment webhooks
│   │   ├── mcp/                  # MCP apps & OAuth
│   │   └── admin/                # Admin-only endpoints
│   ├── layout.tsx                # Root layout
│   └── providers.tsx             # Context providers
│
├── components/                   # React components
│   ├── ui/                       # shadcn/ui base components
│   ├── main/                     # Authenticated app components
│   │   ├── chat/                 # Chat UI components
│   │   ├── sidebar/             # Sidebar navigation
│   │   └── ...
│   ├── admin/                    # Admin panel components
│   ├── marketing/               # Marketing components
│   └── shared/                   # Cross-cutting components
│
├── lib/                          # Core library code
│   ├── redis.ts                  # Redis client, KEYS, TTL, CHANNELS
│   ├── prisma.ts                 # Prisma client singleton
│   ├── auth.ts                   # validateAuth, getOrCreateUser
│   ├── config.ts                 # AI model configuration
│   ├── prompts.ts                # AI system prompts
│   ├── context-manager.ts        # AI context building
│   ├── web-search.ts             # SearxNG integration
│   ├── scraper.ts                # Content extraction
│   ├── security.ts               # Security headers
│   ├── cors.ts                   # CORS configuration
│   ├── polar-config.ts           # Polar SDK config
│   ├── validations/              # Zod schemas by domain
│   ├── mcp/                      # MCP OAuth, encryption, auth
│   └── ai/                       # AI providers, embeddings
│
├── services/                     # Business logic layer
│   ├── chat.service.ts           # Chat CRUD, branching
│   ├── credit.service.ts         # Credit balance, deductions
│   ├── limit.service.ts          # Plan limits enforcement
│   ├── plan.service.ts           # Plan data access
│   ├── memory.service.ts          # User memory operations
│   ├── summarize.service.ts       # Hierarchical context summarization
│   ├── rate-limit.service.ts     # Redis-based rate limiting
│   ├── resumable-stream.service.ts  # SSE streaming with resume
│   ├── mcp-tools.service.ts      # MCP tool discovery
│   ├── mcp-tool-executor.service.ts # MCP tool execution
│   ├── rag.service.ts            # RAG context retrieval
│   ├── queue.service.ts          # BullMQ job queue
│   └── workers.ts                # Background job processors
│
├── hooks/                        # Custom React hooks
│   ├── use-chat.ts              # Chat operations
│   ├── use-chat-messages.ts      # Message handling
│   └── ...
│
├── prisma/                       # Database schema
│   └── schema.prisma
│
└── types/                        # Shared TypeScript types
```

---

## Data Flow

```
Browser Request
      │
      ▼
┌──────────────────────────────────────┐
│          API Route Handler           │
│   app/api/{domain}/route.ts           │
│   1. Rate limit check                │
│   2. Authenticate (validateAuth)    │
│   3. Parse input (Zod schema)       │
│   4. Call service function           │
└──────────────────────────────────────┘
      │
      ▼
┌──────────────────────────────────────┐
│           Service Layer             │
│   services/{feature}.service.ts     │
│   1. Business logic                 │
│   2. Redis cache-aside reads        │
│   3. Prisma database operations     │
└──────────────────────────────────────┘
      │
      ▼
┌──────────────────────────────────────┐
│        Data Storage                 │
│   PostgreSQL ← Prisma ORM          │
│   Redis ← Cache + Pub/Sub           │
└──────────────────────────────────────┘
```

---

## Core Patterns

### API Route Pattern

```typescript
// app/api/example/route.ts
export async function POST(request: NextRequest) {
  // 1. Rate limit
  const rateLimitResult = await rateLimit(request, "default");
  if (!rateLimitResult.success) return rateLimitResponse(rateLimitResult.resetAt);

  // 2. Authenticate
  let user;
  try {
    user = await getOrCreateUser(request);
  } catch (error) {
    if (error instanceof AccountDeactivatedError) {
      return NextResponse.json({ error: "Account deactivated" }, { status: 403 });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 3. Validate input
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.issues);

  // 4. Business logic
  const result = await someService(user.id, parsed.data);

  // 5. Return
  return NextResponse.json(result);
}
```

### Redis Cache-Aside Pattern

```typescript
async function getUserData(userId: string) {
  const cacheKey = KEYS.userData(userId);

  // Try cache first
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch { /* Redis down, continue to DB */ }

  // Fallback to database
  const data = await prisma.user.findUnique({ where: { id: userId } });

  // Cache result
  try {
    await redis.setex(cacheKey, TTL.userData, JSON.stringify(data));
  } catch { /* Cache failed, non-critical */ }

  return data;
}
```

### Redis Pub/Sub Pattern

```typescript
// Publishing an event
await redis.publish(
  CHANNELS.sidebar(userId),
  JSON.stringify({ type: "chat:archived", chatId: chat.id })
);

// In SSE route handler (subscriber)
redisSub.subscribe(CHANNELS.sidebar(userId));
redisSub.on("message", (channel, message) => {
  // Relay to SSE client
});
```

---

## Key Technologies

| Component | Technology |
|-----------|------------|
| Framework | Next.js 16.2.4, React 19.2.5 |
| Runtime | Bun |
| Database | PostgreSQL + Prisma |
| Cache/PubSub | Redis (ioredis) |
| Auth | Stack Auth |
| AI | OpenAI (GPT models via @ai-sdk/openai) |
| Payments | Polar (Merchant of Record) |
| Search | SearxNG |
| Job Queue | BullMQ (Redis-backed) |
| UI | shadcn/ui, Radix, Tailwind CSS |

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/mydb

# Redis
REDIS_URL=redis://localhost:6380

# Stack Auth
STACK_SECRET_KEY=sk_...
STACK_PUBLISHABLE_KEY=pk_...

# OpenAI AI
OPENAI_API_KEY=gsk_...

# Web Search
SEARXNG_BASE_URL=http://localhost:8888

# Polar Payments
POLAR_ACCESS_TOKEN=pk_live_...
POLAR_WEBHOOK_SECRET=whsec_...
POLAR_MODE=sandbox

# AI Settings
AI_MODEL=eryx-fast
AI_MODEL_WITH_TOOLS=eryx-fast
AI_MAX_TOKENS=1024

# MCP Apps
MCP_CREDENTIALS_ENCRYPTION_KEY=your-32-byte-secret
MCP_OAUTH_CALLBACK_ORIGIN=http://localhost:3000
```

---

## Adding a New Feature

### 1. Create API Route
```
app/api/{feature}/route.ts
```
- Follow API route pattern
- Import validators from `lib/validations/`
- Import auth from `@/lib/auth`

### 2. Create Service
```
services/{feature}.service.ts
```
- Export typed interfaces
- Use `prisma` from `@/lib/prisma`
- Use `redis` from `@/lib/redis`
- Follow cache-aside pattern

### 3. Add Redis Keys
```
lib/redis.ts
```
- Add KEYS.{feature}()
- Add TTL.{feature}
- Add CHANNELS.{feature} if pub/sub needed

### 4. Add Validation Schema
```
lib/validations/{feature}.ts
```
- Zod schema for input validation

---

## Redis Key Patterns

```typescript
export const KEYS = {
  // Chat
  chatMessages: (chatId) => `chat:${chatId}:messages`,
  chatMeta: (chatId) => `chat:${chatId}:meta`,

  // User data
  userChats: (userId) => `chats:user:${userId}`,
  userCache: (stackId) => `user:cache:${stackId}`,
  userLimits: (userId) => `user:limits:${userId}`,

  // Rate limiting
  userRateLimit: (userId) => `user:${userId}:rate_limit`,

  // Search
  searchResults: (query) => `search:${hash(query)}`,

  // Streaming
  streamChunks: (chatId) => `stream:${chatId}:chunks`,
  streamStop: (chatId) => `stream:${chatId}:stop`,
} as const;

export const CHANNELS = {
  sidebar: (userId) => `sidebar:${userId}`,
  chat: (chatId) => `chat:${chatId}`,
  notifications: (userId) => `notifications:${userId}`,
} as const;
```

---

## SSE Real-Time Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        Redis Pub/Sub                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ sidebar:*    │  │ chat:*       │  │ notifications:*│        │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼─────────────────┼─────────────────┼───────────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
    ┌──────────┐      ┌──────────┐      ┌──────────┐
    │ SSE      │      │ SSE      │      │ SSE      │
    │ /chats/  │      │ /chats/: │      │ /notifs/ │
    │ stream   │      │ id/stream│      │ stream   │
    └──────────┘      └──────────┘      └──────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            ▼
                     All connected clients
                     receive real-time updates
```
