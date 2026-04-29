import { z } from "zod";

// ================== Generic Schemas ==================

export const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

export const idParamSchema = z.object({
  id: z.string().min(1),
});