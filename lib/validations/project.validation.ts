import { z } from "zod";

// ================== Project Schemas ==================

export const createProjectSchema = z.object({
  name: z.string().min(2).max(50, "Project name must be 2-50 characters"),
  description: z.string().max(500).default(""),
  instruction: z.string().max(2000).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  description: z.string().max(500).optional(),
  instruction: z.string().max(2000).optional(),
  archivedAt: z.string().datetime().nullable().optional(),
});

export const projectQuerySchema = z.object({
  archived: z.enum(["true", "false"]).optional(),
});