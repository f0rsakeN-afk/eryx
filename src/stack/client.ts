"use client";

import { StackClientApp } from "@stackframe/stack";

let stackClientApp: StackClientApp | null = null;

export function getStackClientApp() {
  if (!stackClientApp) {
    stackClientApp = new StackClientApp({
      tokenStore: "nextjs-cookie",
    });
  }
  return stackClientApp;
}
