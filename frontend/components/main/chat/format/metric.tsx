"use client";

import { memo, useMemo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { CodeBlock } from "./code-block";

interface MetricItem {
  label: string;
  value: string;
  trend?: string;
  up?: boolean;
  description?: string;
}

interface MetricData {
  title?: string;
  items: MetricItem[];
}

export const MetricBoard = memo(function MetricBoard({ data }: { data: string }) {
  const parsed = useMemo<MetricData | null>(() => {
    try { return JSON.parse(data); } catch { return null; }
  }, [data]);

  if (!parsed?.items?.length) return <CodeBlock language="json">{data}</CodeBlock>;

  return (
    <div className="my-6 rounded-xl border border-border bg-muted/20 p-6">
      {parsed.title && (
        <h4 className="mb-5 text-[15px] font-semibold text-foreground">{parsed.title}</h4>
      )}
      <div className={cn(
        "grid gap-4",
        parsed.items.length <= 2 && "grid-cols-2",
        parsed.items.length === 3 && "grid-cols-3",
        parsed.items.length >= 4 && "grid-cols-2 sm:grid-cols-4",
      )}>
        {parsed.items.map((item, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-border bg-card p-4 min-w-0">
            <p className="mb-2 truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">{item.label}</p>
            <p className="truncate text-2xl font-bold tracking-tight text-foreground">{item.value}</p>
            {item.trend && (
              <div className={cn(
                "mt-2 flex min-w-0 items-center gap-1 text-[12px] font-medium",
                item.up ? "text-emerald-500" : "text-red-500",
              )}>
                {item.up
                  ? <TrendingUp className="h-3.5 w-3.5 shrink-0" />
                  : <TrendingDown className="h-3.5 w-3.5 shrink-0" />
                }
                <span className="truncate">{item.trend}</span>
              </div>
            )}
            {item.description && (
              <p className="mt-1 truncate text-[11px] text-muted-foreground/60">{item.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});
