"use client";

import { memo, useMemo } from "react";
import { CodeBlock } from "./code-block";

interface PersonaTrait {
  label: string;
  value: number; // 0–100
}

interface PersonaData {
  name: string;
  role?: string;
  avatar?: string; // initials fallback
  bio?: string;
  tags?: string[];
  traits?: PersonaTrait[];
}

export const PersonaCard = memo(function PersonaCard({
  data,
}: {
  data: string;
}) {
  const parsed = useMemo<PersonaData | null>(() => {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }, [data]);

  if (!parsed?.name) return <CodeBlock language="json">{data}</CodeBlock>;

  const initials =
    parsed.avatar ??
    parsed.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Header band */}
      <div className="h-16 w-full bg-linear-to-r from-primary/20 via-primary/10 to-transparent" />
      <div className="px-6 pb-6">
        {/* Avatar */}
        <div className="-mt-8 mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-card bg-primary/10 text-lg font-bold text-primary shadow-sm">
          {initials}
        </div>
        <h4 className="text-[16px] font-bold text-foreground">{parsed.name}</h4>
        {parsed.role && (
          <p className="mb-2 text-[13px] text-muted-foreground">
            {parsed.role}
          </p>
        )}

        {parsed.tags && parsed.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {parsed.tags.map((tag, i) => (
              <span
                key={i}
                className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {parsed.bio && (
          <p className="mb-5 text-[13px] text-foreground/70 leading-relaxed wrap-break-word! whitespace-normal">
            {parsed.bio}
          </p>
        )}

        {parsed.traits && parsed.traits.length > 0 && (
          <div className="space-y-2.5">
            {parsed.traits.map((trait, i) => (
              <div key={i}>
                <div className="mb-1 flex items-center justify-between text-[12px]">
                  <span className="text-muted-foreground">{trait.label}</span>
                  <span className="font-semibold tabular-nums text-foreground">
                    {trait.value}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/40">
                  <div
                    className="h-full rounded-full bg-primary/70 transition-all duration-700"
                    style={{
                      width: `${Math.min(100, Math.max(0, trait.value))}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
