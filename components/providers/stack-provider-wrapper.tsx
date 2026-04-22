"use client";

import { StackProvider, StackTheme } from "@stackframe/stack";
import { getStackClientApp } from "@/src/stack/client";

export function StackProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <StackProvider app={getStackClientApp()}>
      <StackTheme>{children}</StackTheme>
    </StackProvider>
  );
}
