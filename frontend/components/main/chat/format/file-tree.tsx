"use client";

import { memo, useMemo } from "react";
import { cn } from "@/lib/utils";

interface TreeNode {
  name: string;
  type: "file" | "dir";
  children?: TreeNode[];
  depth: number;
}

function parseTree(raw: string): TreeNode[] {
  const lines = raw.split("\n").filter((l) => l.trim());
  const nodes: TreeNode[] = [];

  for (const line of lines) {
    const stripped = line.replace(/^[│├└─\s]+/, "");
    const depth = Math.floor((line.length - stripped.length) / 2);
    const isDir = stripped.endsWith("/") || (!stripped.includes(".") && !stripped.includes(" "));
    nodes.push({ name: stripped.replace(/\/$/, ""), type: isDir ? "dir" : "file", depth });
  }
  return nodes;
}

const FILE_ICON: Record<string, string> = {
  tsx: "⚛", ts: "𝚃𝚂", js: "𝙹𝚂", jsx: "⚛", css: "🎨", json: "𝙹",
  md: "📄", png: "🖼", jpg: "🖼", svg: "🖼", env: "🔑", lock: "🔒",
};

function getIcon(name: string, isDir: boolean) {
  if (isDir) return "📁";
  const ext = name.split(".").pop() ?? "";
  return FILE_ICON[ext] ?? "📄";
}

const TreeLine = memo(function TreeLine({ node, isLast }: { node: TreeNode; isLast: boolean }) {
  return (
    <div className={cn("flex items-center gap-1.5 py-0.5 text-[13px]")} style={{ paddingLeft: `${node.depth * 16}px` }}>
      <span className="text-[11px] opacity-60">{isLast ? "└" : "├"}</span>
      <span className="text-[12px]">{getIcon(node.name, node.type === "dir")}</span>
      <span className={cn(
        node.type === "dir" ? "font-semibold text-foreground" : "text-foreground/75",
      )}>
        {node.name}{node.type === "dir" ? "/" : ""}
      </span>
    </div>
  );
});

export const FileTreeVisualizer = memo(function FileTreeVisualizer({ data }: { data: string }) {
  const nodes = useMemo(() => parseTree(data), [data]);

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-border bg-muted/20">
      <div className="border-b border-border/50 bg-muted/40 px-4 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">File Structure</span>
      </div>
      <div className="overflow-x-auto p-4 font-mono">
        {nodes.map((node, i) => {
          const nextNode = nodes[i + 1];
          const isLast = !nextNode || nextNode.depth <= node.depth;
          return <TreeLine key={i} node={node} isLast={isLast} />;
        })}
      </div>
    </div>
  );
});
