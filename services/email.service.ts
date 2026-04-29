/**
 * Email Service using Resend
 * Handles transactional emails with templates
 */

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || "Eryx <noreply@eryx.ai>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export interface EmailTemplate {
  subject: string;
  html: string;
}

/**
 * Email templates
 */
const TEMPLATES: Record<string, (data: Record<string, unknown>) => EmailTemplate> = {
  "welcome": (data) => ({
    subject: "Welcome to Eryx!",
    html: `
      <h1>Welcome to Eryx!</h1>
      <p>Hi ${data.name || "there"},</p>
      <p>Thanks for joining Eryx. We're excited to have you on board!</p>
      <p>Get started by creating your first chat at ${APP_URL}.</p>
      <p>If you have any questions, just reply to this email.</p>
      <p>- The Eryx Team</p>
    `,
  }),

  "credits-added": (data) => ({
    subject: `${data.credits} credits added to your account!`,
    html: `
      <h1>Credits Added!</h1>
      <p>Hi ${data.name || "there"},</p>
      <p>We've added <strong>${data.credits} credits</strong> to your account.</p>
      <p>Your new balance: <strong>${data.newBalance} credits</strong></p>
      <p>Use them for AI chat, web search, file analysis, and more!</p>
      <p><a href="${APP_URL}">Start chatting →</a></p>
    `,
  }),

  "subscription-activated": (data) => ({
    subject: `Your ${data.planName} subscription is active!`,
    html: `
      <h1>Subscription Activated!</h1>
      <p>Hi ${data.name || "there"},</p>
      <p>Your <strong>${data.planName}</strong> subscription is now active.</p>
      <ul>
        <li>${data.credits} credits per month</li>
        <li>Up to ${data.maxProjects} projects</li>
        <li>Up to ${data.maxChats} chats</li>
      </ul>
      <p>Thank you for your support!</p>
      <p><a href="${APP_URL}">Get started →</a></p>
    `,
  }),

  "subscription-canceled": (data) => ({
    subject: "Subscription Canceled",
    html: `
      <h1>Subscription Canceled</h1>
      <p>Hi ${data.name || "there"},</p>
      <p>Your subscription has been canceled. You can still use your remaining credits.</p>
      <p>Current balance: <strong>${data.credits} credits</strong></p>
      <p>If you change your mind, you can resubscribe anytime at ${APP_URL}.</p>
    `,
  }),

  "credits-low": (data) => ({
    subject: "Low credits warning",
    html: `
      <h1>Running Low on Credits</h1>
      <p>Hi ${data.name || "there"},</p>
      <p>You're down to <strong>${data.credits} credits</strong>.</p>
      <p>Top up to keep chatting without interruption!</p>
      <p><a href="${APP_URL}/billing">Upgrade your plan →</a></p>
    `,
  }),

  "password-reset": (data) => ({
    subject: "Reset your password",
    html: `
      <h1>Password Reset</h1>
      <p>You requested a password reset. Click the link below:</p>
      <p><a href="${data.resetUrl}">Reset Password →</a></p>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, ignore this email.</p>
    `,
  }),

  "export-complete": (data) => ({
    subject: "Your data export is ready!",
    html: `
      <h1>Data Export Ready!</h1>
      <p>Hi ${data.name || "there"},</p>
      <p>Your data export is complete and ready for download.</p>
      <p><a href="${data.downloadUrl}">Download your data →</a></p>
      <p>This link expires in 24 hours.</p>
      <p>The export contains:</p>
      <ul>
        <li>Account information</li>
        <li>Settings and preferences</li>
        <li>Projects</li>
        <li>Conversations and messages</li>
        <li>Feedback and reports</li>
        <li>MCP server configurations</li>
      </ul>
      <p>- The Eryx Team</p>
    `,
  }),

  "export-failed": (data) => ({
    subject: "Data export failed",
    html: `
      <h1>Data Export Failed</h1>
      <p>Hi ${data.name || "there"},</p>
      <p>Unfortunately, your data export failed.</p>
      <p>Error: ${data.error || "Unknown error"}</p>
      <p>Please try again later or contact support if the problem persists.</p>
      <p><a href="${APP_URL}/settings">Go to Settings →</a></p>
      <p>- The Eryx Team</p>
    `,
  }),
};

/**
 * Send an email using Resend
 */
export async function sendEmail(
  to: string,
  template: string,
  data: Record<string, unknown>
): Promise<{ success: boolean; id?: string; error?: string }> {
  // Get template
  const templateFn = TEMPLATES[template];
  if (!templateFn) {
    return { success: false, error: `Unknown template: ${template}` };
  }

  const { subject, html } = templateFn(data);

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (result.error) {
      console.error("[Email] Resend error:", result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error("[Email] Failed to send:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Send raw email (for custom emails)
 */
export async function sendRawEmail(
  to: string,
  subject: string,
  html: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    return { success: true, id: result.data?.id };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
