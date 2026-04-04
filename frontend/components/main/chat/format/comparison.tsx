"use client";

import { memo, useMemo } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { CodeBlock } from "./code-block";

interface ComparisonItem {
  name: string;
  badge?: string;
  description?: string;
  features: string[];
  highlight?: boolean;
}

interface ComparisonData {
  title?: string;
  items: ComparisonItem[];
}

export const ComparisonVisualizer = memo(function ComparisonVisualizer({
  data,
}: {
  data: string;
}) {
  const parsed = useMemo<ComparisonData | null>(() => {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }, [data]);

  if (!parsed?.items?.length)
    return <CodeBlock language="json">{data}</CodeBlock>;

  return (
    <div className="my-6 rounded-xl border border-border bg-muted/20 p-6">
      {parsed.title && (
        <h4 className="mb-6 text-[15px] font-semibold text-foreground">
          {parsed.title}
        </h4>
      )}
      <div
        className={cn(
          "grid gap-4",
          parsed.items.length === 2 && "grid-cols-1 sm:grid-cols-2",
          parsed.items.length === 3 && "grid-cols-1 sm:grid-cols-3",
          parsed.items.length >= 4 &&
            "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        )}
      >
        {parsed.items.map((item, i) => (
          <div
            key={i}
            className={cn(
              "relative flex min-w-0 flex-col overflow rounded-xl border p-4",
              item.highlight
                ? "border-primary/40 bg-primary/5 shadow-sm"
                : "border-border bg-card",
            )}
          >
            {item.badge && (
              <span className="absolute -top-2.5 left-4 max-w-[80%] truncate rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                {item.badge}
              </span>
            )}
            <h5 className="mb-1 truncate text-[14px] font-bold text-foreground">
              {item.name}
            </h5>
            {item.description && (
              <p className="mb-3 wrap-break-word! text-[12px] text-muted-foreground leading-relaxed whitespace-normal">
                {item.description}
              </p>
            )}
            <ul className="mt-auto space-y-1.5">
              {item.features.map((f, j) => (
                <li
                  key={j}
                  className="flex items-start gap-2 text-[13px] text-foreground/80"
                >
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="wrap-break-word! whitespace-normal min-w-0">
                    {f}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
});
