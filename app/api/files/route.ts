/**
 * Files API
 * GET /api/files - List all user files
 * DELETE handled in [id]/route.ts
 */

import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser, AccountDeactivatedError } from "@/lib/auth";
import { rateLimit, rateLimitResponse } from "@/services/rate-limit.service";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(request, "default");
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult.resetAt);
    }

    // Authenticate
    let user;
    try {
      user = await getOrCreateUser(request);
    } catch (error) {
      if (error instanceof AccountDeactivatedError) {
        return NextResponse.json({ error: "Account deactivated" }, { status: 403 });
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const cursor = searchParams.get("cursor");
    const projectId = searchParams.get("projectId");
    const type = searchParams.get("type"); // filter by file type

    // Get all files user owns (via project or chat/message associations)
    // We need to first get file IDs through separate queries
    const projectFileIds = await prisma.projectFile.findMany({
      where: { project: { userId: user.id } },
      select: { fileId: true },
    });
    const chatFileIds = await prisma.chatFile.findMany({
      where: { chat: { userId: user.id } },
      select: { fileId: true },
    });
    // For message files, we need to join through message to get chat->user
    const messageFileRecords = await prisma.messageFile.findMany({
      where: { message: { chat: { userId: user.id } } },
      select: { fileId: true },
    });
    const messageFileIds = messageFileRecords.map((f) => f.fileId);

    // Combine and dedupe file IDs
    const allFileIds = [
      ...new Set([
        ...projectFileIds.map((f) => f.fileId),
        ...chatFileIds.map((f) => f.fileId),
        ...messageFileIds,
      ]),
    ];

    if (allFileIds.length === 0) {
      return NextResponse.json({ files: [], nextCursor: null, totalCount: 0 });
    }

    // Fetch files with pagination
    const files = await prisma.file.findMany({
      where: {
        id: { in: allFileIds },
        // Optional filters
        ...(projectId ? { projectId } : {}),
        ...(type ? { type } : {}),
      },
      select: {
        id: true,
        name: true,
        type: true,
        url: true,
        status: true,
        extractedContent: true,
        contentPreview: true,
        tokenCount: true,
        createdAt: true,
        projectId: true,
        project: {
          select: { id: true, name: true },
        },
        _count: {
          select: {
            chatFiles: true,
            messageFiles: true,
            projectFiles: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 100),
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    // Get total count for pagination
    const totalCount = allFileIds.length;

    // Group files by context (project, chat, message)
    const filesWithContext = await Promise.all(
      files.map(async (file) => {
        // Find associated chat IDs
        const chatFileRecords = await prisma.chatFile.findMany({
          where: { fileId: file.id },
          select: { chatId: true },
        });
        const messageFileRecords = await prisma.messageFile.findMany({
          where: { fileId: file.id },
          select: { messageId: true, message: { select: { chatId: true } } },
        });

        // Get unique chat IDs
        const chatIds = [
          ...new Set([
            ...chatFileRecords.map((cf) => cf.chatId),
            ...messageFileRecords.map((mf) => mf.message.chatId),
          ]),
        ];

        return {
          ...file,
          chatIds,
          contextCount: file._count.chatFiles + file._count.messageFiles + file._count.projectFiles,
        };
      })
    );

    const nextCursor = files.length === limit ? files[files.length - 1].id : null;

    return NextResponse.json({
      files: filesWithContext,
      nextCursor,
      totalCount,
    });
  } catch (error) {
    logger.error("Error fetching files", error as Error, { userId: "unknown" });
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 }
    );
  }
}