"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthStatus {
  authenticated: boolean;
  seenOnboarding?: boolean;
  email?: string;
}

interface OnboardingGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function OnboardingGuard({ children, fallback }: OnboardingGuardProps) {
  const router = useRouter();
  const [status, setStatus] = useState<AuthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/status");
        if (!res.ok) {
          setStatus({ authenticated: false });
          return;
        }
        const data: AuthStatus = await res.json();
        setStatus(data);
      } catch {
        setStatus({ authenticated: false });
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  useEffect(() => {
    if (status && status.authenticated && !status.seenOnboarding) {
      router.push("/onboarding");
    }
  }, [status, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (status && !status.authenticated) {
    router.push("/login");
    return fallback || null;
  }

  if (status && status.authenticated && !status.seenOnboarding) {
    return fallback || null;
  }

  return <>{children}</>;
}
