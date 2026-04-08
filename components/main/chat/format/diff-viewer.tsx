"use client";

import { memo, useMemo, useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type LineType = "added" | "removed" | "context" | "header" | "hunk";

interface DiffLine {
  type: LineType;
  content: string;
  lineNo?: number;
}

function parseDiff(raw: string): DiffLine[] {
  return raw.split("\n").map((line) => {
    if (line.startsWith("---") || line.startsWith("+++")) return { type: "header", content: line };
    if (line.startsWith("@@")) return { type: "hunk", content: line };
    if (line.startsWith("+")) return { type: "added", content: line.slice(1) };
    if (line.startsWith("-")) return { type: "removed", content: line.slice(1) };
    return { type: "context", content: line.startsWith(" ") ? line.slice(1) : line };
  });
}

export const DiffViewer = memo(function DiffViewer({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const lines = useMemo(() => parseDiff(code), [code]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-border bg-muted/20">
      <div className="flex items-center justify-between border-b border-border/50 bg-muted/40 px-4 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">Diff</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground/60 hover:bg-muted hover:text-muted-foreground transition-colors"
        >
          {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full font-mono text-[13px]">
          <tbody>
            {lines.map((line, i) => (
              <tr key={i} className={cn(
                "leading-relaxed",
                line.type === "added"   && "bg-emerald-500/10",
                line.type === "removed" && "bg-red-500/10",
                line.type === "hunk"    && "bg-primary/5",
                line.type === "header"  && "bg-muted/40",
              )}>
                <td className={cn(
                  "select-none w-4 px-3 py-0.5 text-[11px] font-bold",
                  line.type === "added"   && "text-emerald-500",
                  line.type === "removed" && "text-red-500",
                  line.type === "hunk"    && "text-primary/60",
                  (line.type === "context" || line.type === "header") && "text-transparent",
                )}>
                  {line.type === "added" ? "+" : line.type === "removed" ? "−" : ""}
                </td>
                <td className={cn(
                  "w-full whitespace-pre px-2 py-0.5",
                  line.type === "added"   && "text-emerald-400 dark:text-emerald-300",
                  line.type === "removed" && "text-red-400 dark:text-red-300",
                  line.type === "hunk"    && "text-primary/70 font-medium",
                  line.type === "header"  && "text-muted-foreground/60",
                  line.type === "context" && "text-foreground/70",
                )}>
                  {line.content || " "}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
