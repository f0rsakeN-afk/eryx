/**
 * Report API
 * POST /api/report - Submit a bug report or issue
 */

import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/src/stack/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser({ tokenStore: request });
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to submit a report." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { reason, description } = body;

    if (!reason || !description) {
      return NextResponse.json(
        { error: "Reason and description are required." },
        { status: 400 }
      );
    }

    // Create report linked to user
    const report = await prisma.report.create({
      data: {
        userId: user.id,
        reason,
        description,
        email: user.primaryEmail || "",
        image: body.image || "",
      },
    });

    return NextResponse.json(
      { message: "Report submitted successfully.", id: report.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Report submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit report." },
      { status: 500 }
    );
  }
}
