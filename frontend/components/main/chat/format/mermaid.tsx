"use client";

import { memo, useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Copy, Check } from "lucide-react";

export const MermaidDiagram = memo(function MermaidDiagram({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    let cancelled = false;

    import("mermaid").then(({ default: mermaid }) => {
      if (cancelled) return;

      mermaid.initialize({
        startOnLoad: false,
        theme: resolvedTheme === "dark" ? "dark" : "default",
        securityLevel: "loose",
        fontFamily: "inherit",
      });

      const id = `mermaid-${Math.random().toString(36).slice(2)}`;
      mermaid.render(id, code.trim())
        .then(({ svg }) => {
          if (cancelled || !ref.current) return;
          ref.current.innerHTML = svg;
          setError(null);
          // Make SVG responsive
          const svgEl = ref.current.querySelector("svg");
          if (svgEl) {
            svgEl.style.maxWidth = "100%";
            svgEl.style.height = "auto";
          }
        })
        .catch((err) => {
          if (!cancelled) setError(String(err?.message ?? "Failed to render diagram"));
        });
    });

    return () => { cancelled = true; };
  }, [code, resolvedTheme]);

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-border bg-muted/20">
      <div className="flex items-center justify-between border-b border-border/50 bg-muted/40 px-4 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">Diagram</span>
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground/60 hover:bg-muted hover:text-muted-foreground transition-colors"
        >
          {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      {error ? (
        <div className="p-6 text-[13px] text-destructive">{error}</div>
      ) : (
        <div ref={ref} className="flex items-center justify-center overflow-x-auto p-6 [&_svg]:max-w-full" />
      )}
    </div>
  );
});
