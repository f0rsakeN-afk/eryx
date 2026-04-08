"use client";

import { memo, useMemo } from "react";
import { CodeBlock } from "./code-block";

interface PollOption {
  label: string;
  votes: number;
}

interface PollData {
  question: string;
  options: PollOption[];
}

export const PollVisualizer = memo(function PollVisualizer({
  data,
}: {
  data: string;
}) {
  const parsed = useMemo<PollData | null>(() => {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }, [data]);

  if (!parsed?.options?.length)
    return <CodeBlock language="json">{data}</CodeBlock>;

  const total = parsed.options.reduce((sum, o) => sum + o.votes, 0);
  const max = Math.max(...parsed.options.map((o) => o.votes));

  return (
    <div className="my-6 rounded-xl border border-border bg-muted/20 p-6">
      <p className="mb-5 text-[15px] font-semibold text-foreground whitespace-normal wrap-break-word!">
        {parsed.question}
      </p>
      <div className="space-y-3">
        {parsed.options.map((opt, i) => {
          const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
          const isLeading = opt.votes === max;
          return (
            <div key={i}>
              <div className="mb-1 flex items-center justify-between text-[13px] whitespace-normal wrap-break-word!">
                <span
                  className={
                    isLeading
                      ? "font-semibold text-foreground"
                      : "text-foreground/70"
                  }
                >
                  {opt.label}
                </span>
                <span className="tabular-nums font-medium text-muted-foreground">
                  {pct}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-border/40">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    background: isLeading
                      ? "hsl(var(--primary))"
                      : "hsl(var(--muted-foreground) / 0.4)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-[11px] text-muted-foreground/50">
        {total.toLocaleString()} total votes
      </p>
    </div>
  );
});
