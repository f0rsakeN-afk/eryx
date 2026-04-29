import { z } from "zod";

// ================== Chat Schemas ==================

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(100000),
});

export const createChatStreamSchema = z.object({
  messages: z.array(chatMessageSchema).min(1, "At least one message is required"),
  chatId: z.string().min(1, "Chat ID is required"),
  mode: z.enum(["chat", "web"]).default("chat"),
  resume: z.boolean().default(false),
  style: z.enum(["concise", "balanced", "detailed"]).default("balanced"),
  model: z.string().optional(),
});

export const stopChatStreamSchema = z.object({
  chatId: z.string().min(1, "Chat ID is required"),
});