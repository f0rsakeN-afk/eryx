"use client";

import * as React from "react";
import { Cpu, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

interface Model {
  value: string;
  label: string;
  description?: string;
}

interface ModelSelectorProps {
  currentModel?: string;
  onModelChange?: (model: string) => void;
}

async function fetchModels(): Promise<Model[]> {
  const res = await fetch("/api/models");
  if (!res.ok) throw new Error("Failed to fetch models");
  const data = await res.json();
  return data.models || [];
}

export function ModelSelector({ currentModel, onModelChange }: ModelSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const { data: models = [], isLoading } = useQuery({
    queryKey: ["models"],
    queryFn: fetchModels,
    staleTime: Infinity,
  });

  const current = models.find((m) => m.value === (currentModel || "eryx-fast")) || models[0];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[12px] transition-all duration-150 relative",
          currentModel && currentModel !== "eryx-fast"
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/70",
          open && "ring-2 ring-primary/30"
        )}
      >
        <Cpu className="h-3.5 w-3.5" />
        <span className="font-medium">{current?.label || "Model"}</span>
        {open && (
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-primary rounded-full" />
        )}
      </PopoverTrigger>
      <PopoverContent side="bottom" align="center" sideOffset={8} className="w-max p-1.5 max-h-[200px] overflow-y-auto hide-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center py-3 px-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : (
          models.map((model) => (
            <button
              key={model.value}
              onClick={() => {
                onModelChange?.(model.value);
                setOpen(false);
              }}
              className={cn(
                "flex items-center gap-2 w-full px-2 py-1.5 text-[12px] rounded-md cursor-pointer transition-all",
                currentModel === model.value
                  ? "text-primary font-medium bg-primary/10"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              )}
            >
              <span>{model.label}</span>
            </button>
          ))
        )}
      </PopoverContent>
    </Popover>
  );
}