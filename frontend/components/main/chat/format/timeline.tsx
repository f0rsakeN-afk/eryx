"use client";

import { memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import { CodeBlock } from "./code-block";

interface TimelineItem {
  title: string;
  description?: string;
  date?: string;
  status?: "done" | "active" | "upcoming";
}

interface TimelineData {
  title?: string;
  items: TimelineItem[];
}

export const TimelineVisualizer = memo(function TimelineVisualizer({
  data,
}: {
  data: string;
}) {
  const parsed = useMemo<TimelineData | null>(() => {
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
      <div className="relative space-y-0">
        {parsed.items.map((item, i) => {
          const isLast = i === parsed.items.length - 1;
          const status = item.status ?? "upcoming";
          return (
            <div key={i} className="relative flex gap-4">
              {/* Spine */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "relative z-10 flex h-5 sm:h-6 xl:h-8 w-5 sm:w-6 xl:w-8 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-bold transition-colors",
                    status === "done" &&
                      "border-primary bg-primary text-primary-foreground",
                    status === "active" &&
                      "border-primary bg-primary/10 text-primary",
                    status === "upcoming" &&
                      "border-border bg-muted text-muted-foreground",
                  )}
                >
                  {status === "done" ? "✓" : i + 1}
                </div>
                {!isLast && (
                  <div className="w-[2px] flex-1 bg-border/60 my-1" />
                )}
              </div>
              {/* Content */}
              <div className={cn("pb-6 pt-1 min-w-0", isLast && "pb-0")}>
                <div className="flex flex-wrap items-center gap-2 mb-0.5 whitespace-normal wrap-break-word!">
                  <span
                    className={cn(
                      "text-[14px] font-semibold",
                      status === "upcoming"
                        ? "text-muted-foreground"
                        : "text-foreground",
                    )}
                  >
                    {item.title}
                  </span>
                  {item.date && (
                    <span className="text-[11px] text-muted-foreground/60 font-medium">
                      {item.date}
                    </span>
                  )}
                  {status === "active" && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      In progress
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="text-[13px] text-muted-foreground leading-relaxed whitespace-normal wrap-break-word!">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
