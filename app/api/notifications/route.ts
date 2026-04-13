/**
 * Notifications API
 * GET /api/notifications - Get user notifications
 * PATCH /api/notifications - Update notification preferences
 * POST /api/notifications/read-all - Mark all as read
 */

import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/src/stack/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser({ tokenStore: request });
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all";
    const now = new Date();

    // Build query based on filter
    const where: Record<string, unknown> = { userId: user.id };
    if (filter === "unread") {
      where.read = false;
      where.archived = false;
      where.snoozedUntil = null;
    } else if (filter === "archived") {
      where.archived = true;
    } else if (filter === "snoozed") {
      where.snoozedUntil = { gt: now };
    }

    // Run all DB queries in parallel for performance
    const [notifications, prefs, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.notificationPrefs.findUnique({
        where: { userId: user.id },
      }).then((p) => p ?? prisma.notificationPrefs.create({ data: { userId: user.id } })),
      prisma.notification.count({
        where: {
          userId: user.id,
          read: false,
          archived: false,
          OR: [{ snoozedUntil: null }, { snoozedUntil: { lt: now } }],
        },
      }),
    ]);

    const formattedNotifications = notifications.map((n) => ({
      id: n.id,
      title: n.title,
      description: n.description,
      time: formatRelativeTime(n.createdAt),
      read: n.read,
      archived: n.archived,
      snoozed: n.snoozedUntil !== null && n.snoozedUntil > now,
      accent: n.accent,
    }));

    const response = NextResponse.json({
      notifications: formattedNotifications,
      unreadCount,
      prefs: {
        newFeature: prefs.newFeature,
        credits: prefs.credits,
        system: prefs.system,
        tips: prefs.tips,
        security: prefs.security,
      },
    });

    // Cache for 30 seconds on the client
    response.headers.set("Cache-Control", "private, max-age=30");

    return response;
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json({ error: "Failed to get notifications" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser({ tokenStore: request });
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Handle preference updates (partial update - only update fields provided)
    if (body.prefs !== undefined) {
      const updateData: Record<string, unknown> = {};
      if (body.prefs.newFeature !== undefined) updateData.newFeature = body.prefs.newFeature;
      if (body.prefs.credits !== undefined) updateData.credits = body.prefs.credits;
      if (body.prefs.system !== undefined) updateData.system = body.prefs.system;
      if (body.prefs.tips !== undefined) updateData.tips = body.prefs.tips;
      if (body.prefs.security !== undefined) updateData.security = body.prefs.security;

      const prefs = await prisma.notificationPrefs.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          newFeature: body.prefs.newFeature ?? true,
          credits: body.prefs.credits ?? true,
          system: body.prefs.system ?? false,
          tips: body.prefs.tips ?? true,
          security: body.prefs.security ?? true,
        },
        update: updateData,
      });

      return NextResponse.json({ prefs });
    }

    // Handle notification updates (mark read, archive, snooze, etc.)
    if (body.notificationId !== undefined && body.action !== undefined) {
      const notification = await prisma.notification.findUnique({
        where: { id: body.notificationId },
      });

      if (!notification || notification.userId !== user.id) {
        return NextResponse.json({ error: "Notification not found" }, { status: 404 });
      }

      const updateData: Record<string, unknown> = {};
      if (body.action === "read") updateData.read = true;
      if (body.action === "unread") updateData.read = false;
      if (body.action === "archive") updateData.archived = true;
      if (body.action === "unarchive") updateData.archived = false;
      if (body.action === "snooze") {
        // Snooze for specified duration in minutes (default 60)
        const duration = body.duration || 60;
        updateData.snoozedUntil = new Date(Date.now() + duration * 60 * 1000);
      }
      if (body.action === "unsnooze") updateData.snoozedUntil = null;

      const updated = await prisma.notification.update({
        where: { id: body.notificationId },
        data: updateData,
      });

      return NextResponse.json({
        id: updated.id,
        read: updated.read,
        archived: updated.archived,
        snoozed: updated.snoozedUntil !== null && updated.snoozedUntil > new Date(),
      });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error("Update notifications error:", error);
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser({ tokenStore: request });
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Mark all as read
    if (body.action === "read-all") {
      await prisma.notification.updateMany({
        where: { userId: user.id, read: false, archived: false },
        data: { read: true },
      });
      return NextResponse.json({ success: true });
    }

    // Archive all read
    if (body.action === "archive-read") {
      await prisma.notification.updateMany({
        where: { userId: user.id, read: true, archived: false },
        data: { archived: true },
      });
      return NextResponse.json({ success: true });
    }

    // Archive all
    if (body.action === "archive-all") {
      await prisma.notification.updateMany({
        where: { userId: user.id, archived: false },
        data: { archived: true },
      });
      return NextResponse.json({ success: true });
    }

    // Unarchive all
    if (body.action === "unarchive-all") {
      await prisma.notification.updateMany({
        where: { userId: user.id, archived: true },
        data: { archived: false },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error("Notifications action error:", error);
    return NextResponse.json({ error: "Failed to perform action" }, { status: 500 });
  }
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
