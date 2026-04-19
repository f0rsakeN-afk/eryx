import type { Metadata } from "next";

const title = "Apps";
const description =
  "Connect your favorite apps to Eryx. Integrate with GitHub, Notion, Slack, Stripe, and 50+ services via MCP.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: "/apps",
    siteName: "Eryx",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    creator: "@eryxai",
  },
  alternates: {
    canonical: "/apps",
  },
};

export default function AppsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}