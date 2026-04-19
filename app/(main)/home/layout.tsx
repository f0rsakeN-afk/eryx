import type { Metadata } from "next";

const title = "Eryx — AI Assistant";
const description =
  "Ask anything. Eryx is a powerful AI chat assistant that helps you code, research, and explore ideas seamlessly.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: "/home",
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
    canonical: "/home",
  },
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
