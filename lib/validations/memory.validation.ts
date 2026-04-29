import { z } from "zod";

// ================== Memory Schemas ==================

export const memoryQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export const createMemorySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(50000),
  tags: z.array(z.string()).max(20).default([]),
  category: z.string().max(50).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateMemorySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(50000).optional(),
  tags: z.array(z.string()).max(20).optional(),
  category: z.string().max(50).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const memoryIdSchema = z.object({
  id: z.string().min(1, "Memory ID is required"),
});