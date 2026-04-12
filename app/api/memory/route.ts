import { NextRequest, NextResponse } from "next/server";
import { validateAuth } from "@/lib/auth";
import {
  getMemories,
  searchMemories,
  addMemory,
  deleteMemory,
  getMemoryCategories,
} from "@/services/memory.service";
import { checkMemoryLimit, getUserLimits } from "@/services/limit.service";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await validateAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category") || undefined;
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

    if (query.trim()) {
      const result = await searchMemories(user.id, query, { limit, category });
      return NextResponse.json(result);
    }

    const result = await getMemories(user.id, { limit, category });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Memory GET error:", error);
    return NextResponse.json({ error: "Failed to fetch memories" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await validateAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, tags, category, metadata } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // Check memory limit
    const limitCheck = await checkMemoryLimit(user.id);
    if (!limitCheck.allowed) {
      const limits = await getUserLimits(user.id);

      // If feature not available at all
      if (limits.maxMemoryItems === 0) {
        return NextResponse.json(
          {
            error: "Memory feature not available",
            code: "MEMORY_NOT_AVAILABLE",
            message: "Upgrade to a paid plan to unlock long-term memory for your AI conversations.",
            action: "upgrade",
            upgradeTo: "Basic",
          },
          { status: 403 }
        );
      }

      // If limit reached
      return NextResponse.json(
        {
          error: "Memory limit reached",
          code: "MEMORY_LIMIT_REACHED",
          message: `You've reached your limit of ${limitCheck.limit} memories. Upgrade to store more.`,
          action: "upgrade",
          upgradeTo: limits.maxMemoryItems === 20 ? "Pro" : null,
          limits: {
            current: limitCheck.current,
            max: limitCheck.limit,
          },
        },
        { status: 403 }
      );
    }

    const memory = await addMemory(user.id, {
      title: title || content.slice(0, 100),
      content,
      tags: tags || [],
      category,
      metadata,
    });

    return NextResponse.json(memory);
  } catch (error) {
    console.error("Memory POST error:", error);
    return NextResponse.json({ error: "Failed to add memory" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await validateAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const memoryId = searchParams.get("id");

    if (!memoryId) {
      return NextResponse.json({ error: "Memory ID required" }, { status: 400 });
    }

    await deleteMemory(memoryId, user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Memory DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete memory" }, { status: 500 });
  }
}
