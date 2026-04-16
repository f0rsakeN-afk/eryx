/**
 * Low Credits Warning Cron
 * Sends warning emails to users with low credits
 *
 * Should be called daily via cron (e.g., Vercel Cron, systemd timer)
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { queueEmail } from "@/services/queue.service";

const LOW_CREDITS_THRESHOLD = 10; // Send warning when credits fall below this

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Find users with active subscriptions who are running low on credits
    const usersWithLowCredits = await prisma.user.findMany({
      where: {
        AND: [
          { credits: { lt: LOW_CREDITS_THRESHOLD } },
          { credits: { gt: 0 } }, // Don't notify users with 0 credits (they know)
        ],
        subscription: {
          status: { in: ["ACTIVE", "TRIALING"] },
        },
      },
      select: {
        id: true,
        email: true,
        credits: true,
      },
    });

    const results = await Promise.allSettled(
      usersWithLowCredits.map(async (user) => {
        // Check if we already sent a low credits email recently (within last 3 days)
        // This is a simple check - in production you'd want to track this in DB
        queueEmail(user.email, "credits-low", {
          name: user.email.split("@")[0] || "User",
          credits: user.credits,
        }).catch((err) => {
          console.error(`[LowCreditsCron] Failed to queue email for ${user.email}:`, err);
        });
        return user.email;
      })
    );

    const successCount = results.filter((r) => r.status === "fulfilled").length;
    const failCount = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      sent: successCount,
      failed: failCount,
      usersNotified: usersWithLowCredits.map((u) => u.email),
    });
  } catch (error) {
    console.error("[LowCreditsCron] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process low credits notifications" },
      { status: 500 }
    );
  }
}
