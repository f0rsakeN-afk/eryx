"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import type { ChangelogEntry, ChangeType } from "@/types/changelog";

const TAG_STYLES: Record<ChangeType, string> = {
  feature: "bg-primary text-primary-foreground",
  improvement: "bg-muted text-foreground border border-border",
  fix: "bg-muted text-muted-foreground border border-border",
  breaking: "bg-destructive text-destructive-foreground",
};

const TAG_LABEL: Record<ChangeType, string> = {
  feature: "Feature",
  improvement: "Improvement",
  fix: "Fix",
  breaking: "Breaking",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface ChangelogListProps {
  entries: ChangelogEntry[];
}

export function ChangelogList({ entries }: ChangelogListProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleGlobalKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    const tag = target.tagName.toLowerCase();
    if (tag === "input" || tag === "textarea" || target.isContentEditable) return;
    if (e.key === "/") {
      e.preventDefault();
      inputRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [handleGlobalKeyDown]);

  return (
    <div>
      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-0 top-2 bottom-0 w-px bg-border hidden lg:block" />

        <ol className="flex flex-col gap-12 lg:gap-14">
          {entries.map((entry) => (
            <li key={entry.version} className="lg:pl-10 relative">
              <div className="absolute -left-[4.5px] top-2 h-2.5 w-2.5 rounded-full bg-foreground border-2 border-background hidden lg:block" />

              <article>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-md bg-muted text-foreground tracking-tight">
                    v{entry.version}
                  </span>
                  <time
                    dateTime={entry.date}
                    className="text-xs tracking-wide text-muted-foreground/70"
                  >
                    {formatDate(entry.date)}
                  </time>
                </div>

                <h2 className="text-base tracking-wide font-semibold text-foreground tracking-tight mb-1.5">
                  {entry.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                  {entry.description}
                </p>

                <ul className="flex flex-col gap-2.5">
                  {entry.changes.map((change, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span
                        className={`mt-px shrink-0 inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${TAG_STYLES[change.type]}`}
                      >
                        {TAG_LABEL[change.type]}
                      </span>
                      <span className="text-sm text-muted-foreground leading-relaxed">
                        {change.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}