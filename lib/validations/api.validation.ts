import { z } from "zod";

// ================== Notification Schemas ==================

export const notificationQuerySchema = z.object({
  filter: z.enum(["all", "unread", "archived", "snoozed"]).default("all"),
});

export const notificationPrefsSchema = z.object({
  newFeature: z.boolean().optional(),
  credits: z.boolean().optional(),
  system: z.boolean().optional(),
  tips: z.boolean().optional(),
  security: z.boolean().optional(),
});

export const notificationActionSchema = z.object({
  notificationId: z.string().min(1),
  action: z.enum(["read", "unread", "archive", "unarchive", "snooze", "unsnooze"]),
  duration: z.number().min(1).max(10080).optional(),
});

export const notificationBulkActionSchema = z.object({
  action: z.enum(["read-all", "archive-read", "archive-all", "unarchive-all"]),
});

// ================== Report Schemas ==================

export const createReportSchema = z.object({
  reason: z.string().min(1).max(100),
  description: z.string().min(1).max(5000),
  image: z.string().max(500).optional(),
});

// ================== Suggestion Schemas ==================

export const suggestQuerySchema = z.object({
  q: z.string().min(2).max(200),
});