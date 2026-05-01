import { Metadata } from "next";
import { Layers, MessageSquare, Database, Brain, RefreshCw } from "lucide-react";

export const metadata: Metadata = {
  title: "How It Works | Eryx",
  description: "Understand how Eryx combines AI chat, RAG-powered search, and system design visualization.",
  alternates: { canonical: "/features/how-it-works" },
};

const pipeline = [
  {
    icon: MessageSquare,
    title: "Conversational Intelligence",
    description: "Multi-turn dialogue with full context. Eryx understands code, follows technical discussions, and remembers what you've explored across sessions.",
    tags: ["Context retention", "Code awareness", "Technical depth"],
  },
  {
    icon: Database,
    title: "RAG-Powered Retrieval",
    description: "When you need external knowledge, Eryx searches the web, retrieves relevant documents, and synthesizes cited answers. No more guessing.",
    tags: ["Real-time search", "Source verification", "Document synthesis"],
  },
  {
    icon: Brain,
    title: "Adaptive Memory",
    description: "Eryx builds a knowledge graph of your projects and preferences. Responses become more aligned with your specific needs over time.",
    tags: ["Project context", "Preference learning", "Cross-session continuity"],
  },
  {
    icon: RefreshCw,
    title: "Resumable Streams",
    description: "Network issues, browser closes, connections drop — none of it matters. Every stream is checkpointed and resumable from exactly where it left off.",
    tags: ["Checkpoint persistence", "Auto-recovery", "No re-computation"],
  },
];

const techStack = [
  { label: "Primary Model", value: "GPT-4o" },
  { label: "Secondary Model", value: "Claude 3.5" },
  { label: "Search Pipeline", value: "Custom RAG" },
  { label: "Memory Store", value: "Vector DB + Redis" },
];

export default function HowItWorksPage() {
  return (
    <div className="bg-background text-foreground antialiased">
      {/* Hero */}
      <section className="relative py-36 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/3 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/8 mb-10">
            <Layers className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-semibold tracking-tight mb-5 leading-[1.15]">
            Three systems,
            <br className="md:hidden" />
            <span className="text-muted-foreground"> one platform</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Chat, search, and memory working in concert. Not three separate tools — a unified experience.
          </p>
        </div>
      </section>

      {/* Pipeline */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-display font-semibold tracking-tight mb-12 text-center">
            The Eryx pipeline
          </h2>
          <div className="space-y-5">
            {pipeline.map((step, i) => (
              <div key={i} className="p-6 rounded-xl border border-border/40 bg-card/50">
                <div className="flex items-start gap-5">
                  <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
                    <step.icon className="w-5 h-5 text-primary/70" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium mb-1">{step.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4">{step.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {step.tags.map((tag, j) => (
                        <span key={j} className="text-[10px] px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-24 px-6 border-t border-border/40">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-display font-semibold tracking-tight mb-12 text-center">
            Infrastructure
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {techStack.map((tech, i) => (
              <div key={i} className="p-5 rounded-xl border border-border/40 bg-card/50 text-center">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-2">{tech.label}</p>
                <p className="text-sm font-medium">{tech.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-24 px-6 border-t border-border/40">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-display font-semibold tracking-tight mb-12 text-center">
            Why it matters
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="p-6 rounded-xl border border-border/30 space-y-4">
              <p className="text-xs font-medium uppercase tracking-wider text-red-500/60">Typical AI chat</p>
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Knowledge cutoff unknown</p>
                <p className="text-xs text-muted-foreground">Hallucination risk without verification</p>
                <p className="text-xs text-muted-foreground">Each session starts fresh</p>
              </div>
            </div>
            <div className="p-6 rounded-xl border border-primary/20 bg-primary/5 space-y-4">
              <p className="text-xs font-medium uppercase tracking-wider text-primary/60">Eryx</p>
              <div className="space-y-3">
                <p className="text-xs text-foreground/80">Real-time data, timestamped</p>
                <p className="text-xs text-foreground/80">Every answer is cited</p>
                <p className="text-xs text-foreground/80">Memory persists across sessions</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}