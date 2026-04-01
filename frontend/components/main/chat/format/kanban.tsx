"use client";

import { memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import { CodeBlock } from "./code-block";

interface KanbanColumn {
  title: string;
  color?: string;
  items: string[];
}

interface KanbanData {
  title?: string;
  columns: KanbanColumn[];
}

const COLUMN_COLORS = [
  "text-muted-foreground border-border/60",
  "text-primary border-primary/30",
  "text-emerald-500 border-emerald-500/30",
];

export const KanbanBoard = memo(function KanbanBoard({
  data,
}: {
  data: string;
}) {
  const parsed = useMemo<KanbanData | null>(() => {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }, [data]);

  if (!parsed?.columns?.length)
    return <CodeBlock language="json">{data}</CodeBlock>;

  return (
    <div className="my-6 rounded-xl border border-border bg-muted/20 p-6">
      {parsed.title && (
        <h4 className="mb-5 text-[15px] font-semibold text-foreground">
          {parsed.title}
        </h4>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {parsed.columns.map((col, i) => {
          const colorClass = COLUMN_COLORS[i % COLUMN_COLORS.length];
          return (
            <div key={i} className="flex flex-col gap-2">
              {/* Column header */}
              <div
                className={cn(
                  "flex items-center justify-between rounded-lg border px-3 py-2",
                  colorClass.split(" ")[1],
                )}
              >
                <span
                  className={cn(
                    "text-[12px] font-bold uppercase tracking-wider",
                    colorClass.split(" ")[0],
                  )}
                >
                  {col.title}
                </span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                    colorClass.split(" ")[0],
                    "bg-current/10",
                  )}
                >
                  {col.items.length}
                </span>
              </div>
              {/* Cards */}
              <div className="flex flex-col gap-2">
                {col.items.map((item, j) => (
                  <div
                    key={j}
                    className="wrap-break-word! whitespace-normal rounded-lg border border-border bg-card px-3 py-2.5 text-[13px] text-foreground/80 shadow-xs"
                  >
                    <p className="wrap-break-word leading-relaxed">{item}</p>
                  </div>
                ))}
                {col.items.length === 0 && (
                  <div className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-[12px] text-muted-foreground/40">
                    Empty
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
