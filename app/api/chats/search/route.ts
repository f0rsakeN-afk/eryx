import { NextRequest, NextResponse } from "next/server";
import { searchUserChats } from "@/lib/stack-server";
import { getOrCreateUser, AccountDeactivatedError } from "@/lib/auth";
import { rateLimit, rateLimitResponse } from "@/services/rate-limit.service";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(request, "default");
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult.resetAt);
    }

    // Validate auth and get user
    const user = await getOrCreateUser(request);

    // Validate query params
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);

    const result = await searchUserChats(user.id, query, limit);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AccountDeactivatedError) {
      return NextResponse.json({ error: "Account deactivated" }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("Error searching chats", error as Error, { userId: "unknown" });
    return NextResponse.json(
      { error: "Failed to search chats" },
      { status: 500 }
    );
  }
}
