/**
 * Account API
 * GET /api/account - Get user account info
 * PATCH /api/account - Update account info
 * DELETE /api/account - Soft delete account
 */

import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/src/stack/server";
import prisma from "@/lib/prisma";
import { updateAccountSchema } from "@/schemas/validation";
import { getPlan } from "@/services/plan.service";

export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser({ tokenStore: request });
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get full user with settings and customize
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        chats: { where: { archivedAt: null } },
        projects: { where: { archivedAt: null } },
        userPlan: true,
        subscription: true,
        customize: true,
      },
    });

    if (!fullUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get plan limits from DB
    const planData = fullUser.userPlan || (await getPlan("free"))!;
    const subscription = fullUser.subscription;

    // Count usage - total
    const chatCount = fullUser.chats.length;
    const projectCount = fullUser.projects.length;

    // Get file count - files owned by user via project or chat associations
    const projectFileCount = await prisma.projectFile.count({
      where: { project: { userId: fullUser.id } },
    });
    const chatFileCount = await prisma.chatFile.count({
      where: { chat: { userId: fullUser.id } },
    });
    const messageFileCount = await prisma.messageFile.count({
      where: { message: { chat: { userId: fullUser.id } } },
    });
    const fileCount = projectFileCount + chatFileCount + messageFileCount;

    // Get message count from all chats
    const messageCountResult = await prisma.message.count({
      where: {
        chat: {
          userId: fullUser.id,
        },
      },
    });

    // Monthly usage (since start of current month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyChatCount = await prisma.chat.count({
      where: {
        userId: fullUser.id,
        createdAt: { gte: startOfMonth },
      },
    });

    const monthlyMessageCount = await prisma.message.count({
      where: {
        chat: {
          userId: fullUser.id,
        },
        createdAt: { gte: startOfMonth },
      },
    });

    // Get name from customize or fallback to email
    const displayName = fullUser.customize?.name || fullUser.email?.split("@")[0] || "User";

    return NextResponse.json({
      profile: {
        id: fullUser.id,
        email: fullUser.email,
        name: displayName,
        createdAt: fullUser.createdAt,
        isActive: fullUser.isActive,
      },
      plan: {
        name: planData.id,
        displayName: planData.name,
        credits: fullUser.credits,
        limits: {
          chats: planData.maxChats === -1 ? "unlimited" : planData.maxChats,
          projects: planData.maxProjects === -1 ? "unlimited" : planData.maxProjects,
          messages: planData.maxMessages === -1 ? "unlimited" : planData.maxMessages,
        },
        features: planData.features,
        limitsDetail: {
          maxMemoryItems: planData.maxMemoryItems,
          maxBranchesPerChat: planData.maxBranchesPerChat,
          maxFolders: planData.maxFolders,
          maxAttachmentsPerChat: planData.maxAttachmentsPerChat,
          maxFileSizeMb: planData.maxFileSizeMb,
          canExport: planData.canExport,
          canApiAccess: planData.canApiAccess,
        },
      },
      subscription: subscription
        ? {
            active: true,
            status: subscription.status,
            periodEnd: subscription.currentPeriodEnd.toISOString(),
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          }
        : { active: false },
      usage: {
        chats: chatCount,
        projects: projectCount,
        messages: messageCountResult,
        files: fileCount,
      },
      monthlyUsage: {
        chats: monthlyChatCount,
        messages: monthlyMessageCount,
      },
    });
  } catch (error) {
    console.error("Get account error:", error);
    return NextResponse.json({ error: "Failed to get account" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser({ tokenStore: request });
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!fullUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateAccountSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Update name in customize table
    if (data.name !== undefined) {
      await prisma.customize.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          name: data.name,
          responseTone: "professional",
          knowledgeDetail: "BALANCED",
          interest: [],
        },
        update: { name: data.name },
      });
    }

    // Admin-only fields
    if (fullUser.role === "ADMIN" || fullUser.role === "MODERATOR") {
      const updateData: Record<string, unknown> = {};
      if (data.plan !== undefined) updateData.planTier = data.plan.toUpperCase();
      if (data.credits !== undefined) updateData.credits = data.credits;
      if (data.maxChats !== undefined) updateData.maxChats = data.maxChats;
      if (data.maxProjects !== undefined) updateData.maxProjects = data.maxProjects;
      if (data.maxMessages !== undefined) updateData.maxMessages = data.maxMessages;
      if (data.features !== undefined) updateData.features = data.features;

      if (Object.keys(updateData).length > 0) {
        await prisma.user.update({
          where: { id: user.id },
          data: updateData,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update account error:", error);
    return NextResponse.json({ error: "Failed to update account" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser({ tokenStore: request });
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!fullUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Soft delete - set isActive to false
    await prisma.user.update({
      where: { id: user.id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true, message: "Account deactivated" });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
