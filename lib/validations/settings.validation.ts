import { z } from "zod";

// ================== Settings Schemas ==================

export const updateLocaleSchema = z.object({
  language: z.string().min(2).max(10),
});

export const deleteChatsSchema = z.object({
  confirm: z.literal(true),
});

// ================== Suggestion Schemas ==================

export const trackSuggestionSchema = z.object({
  type: z.enum(["click", "dismiss", "shown"]),
  suggestionId: z.string(),
  chatId: z.string().optional(),
});