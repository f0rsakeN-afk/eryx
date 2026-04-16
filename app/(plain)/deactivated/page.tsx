"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, Mail, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DeactivatedPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const reason = searchParams.get("reason");

  return (
    <div className="min-h-dvh bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Account Deactivated
          </h1>
          <p className="text-sm text-muted-foreground">
            Your account has been deactivated. You can no longer access Eryx
            until your account is reactivated.
          </p>
        </div>

        {reason && (
          <div className="bg-muted/50 rounded-lg p-4 text-left">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Reason
            </p>
            <p className="text-sm text-foreground">{reason}</p>
          </div>
        )}

        <div className="bg-muted/50 rounded-lg p-4 text-left space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            What happens now?
          </p>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              Your data is retained for 30 days
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              Contact support to reactivate your account
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              After reactivation, all your data will be restored
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => (window.location.href = "mailto:support@eryx.ai")}
          >
            <Mail className="w-4 h-4" />
            Contact Support
          </Button>

          <Button
            variant="ghost"
            className="w-full gap-2"
            onClick={() => (window.location.href = "/")}
          >
            <RefreshCw className="w-4 h-4" />
            Return Home
          </Button>
        </div>

        {email && (
          <p className="text-xs text-muted-foreground">
            Account: {email}
          </p>
        )}
      </div>
    </div>
  );
}
