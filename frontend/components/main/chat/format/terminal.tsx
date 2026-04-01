"use client";

import { memo, useState, useCallback } from "react";
import { Copy, Check, Terminal } from "lucide-react";

export const TerminalBlock = memo(function TerminalBlock({ output }: { output: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const lines = output.split("\n");

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-border bg-zinc-950 dark:bg-zinc-950 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-2">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-white/40" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-white/40">Terminal</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-white/40 hover:bg-white/10 hover:text-white/70 transition-colors"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      {/* Output */}
      <div className="overflow-x-auto p-4">
        <pre className="font-mono text-[13px] leading-relaxed">
          {lines.map((line, i) => {
            const isCommand = line.startsWith("$") || line.startsWith(">");
            const isError = /error|fail|fatal/i.test(line) && !isCommand;
            const isSuccess = /success|done|✓|✔|complete/i.test(line) && !isCommand;
            const isWarning = /warn/i.test(line) && !isCommand;
            return (
              <div key={i} className={
                isCommand  ? "text-emerald-400" :
                isError    ? "text-red-400" :
                isSuccess  ? "text-emerald-400/80" :
                isWarning  ? "text-yellow-400/80" :
                             "text-white/70"
              }>
                {line || " "}
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
});
