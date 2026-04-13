/**
 * Stripe Subscription API
 * POST /api/stripe/subscription - Cancel subscription
 * DELETE /api/stripe/subscription - Reactivate canceled subscription
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripeConfig } from "@/lib/stripe-config";
import { validateAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { invalidateUserLimitsCache } from "@/services/limit.service";

const stripe = new Stripe(stripeConfig.secretKey);

export async function POST(request: NextRequest) {
  try {
    const user = await validateAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    if (!subscription) {
      return NextResponse.json({ error: "No subscription found" }, { status: 404 });
    }

    if (subscription.status === "CANCELED") {
      return NextResponse.json({ error: "Subscription already canceled" }, { status: 400 });
    }

    if (!subscription.stripeSubId) {
      return NextResponse.json({ error: "No Stripe subscription ID found" }, { status: 400 });
    }

    // Cancel at period end (keep access until then)
    await stripe.subscriptions.update(subscription.stripeSubId, {
      cancel_at_period_end: true,
    });

    // Update local record
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { cancelAtPeriodEnd: true },
    });

    return NextResponse.json({ success: true, message: "Subscription will be canceled at period end" });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await validateAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    if (!subscription) {
      return NextResponse.json({ error: "No subscription found" }, { status: 404 });
    }

    if (!subscription.stripeSubId) {
      return NextResponse.json({ error: "No Stripe subscription ID found" }, { status: 400 });
    }

    if (!subscription.cancelAtPeriodEnd) {
      return NextResponse.json({ error: "Subscription is not scheduled for cancellation" }, { status: 400 });
    }

    // Reactivate - undo the cancel_at_period_end
    await stripe.subscriptions.update(subscription.stripeSubId, {
      cancel_at_period_end: false,
    });

    // Update local record
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { cancelAtPeriodEnd: false },
    });

    return NextResponse.json({ success: true, message: "Subscription reactivated" });
  } catch (error) {
    console.error("Reactivate subscription error:", error);
    return NextResponse.json({ error: "Failed to reactivate subscription" }, { status: 500 });
  }
}
