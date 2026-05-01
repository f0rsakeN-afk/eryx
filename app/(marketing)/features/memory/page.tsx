import { Metadata } from "next";
import { Brain, Database, Bookmark, Lightbulb } from "lucide-react";

export const metadata: Metadata = {
  title: "Memory | Eryx",
  description: "Eryx remembers context across conversations with advanced memory features.",
  alternates: { canonical: "/features/memory" },
};

const memoryTypes = [
  {
    icon: Database,
    title: "Project Memory",
    description: "Eryx learns your project structure, architecture decisions, and coding patterns. It understands your codebase context across conversations.",
    tags: ["Architecture awareness", "Codebase context", "Pattern recognition"],
  },
  {
    icon: Bookmark,
    title: "Conversation Continuity",
    description: "Longer context windows mean Eryx maintains the full thread of your discussions. Pick up exactly where you left off.",
    tags: ["Multi-turn context", "Thread persistence", "Session recall"],
  },
  {
    icon: Lightbulb,
    title: "Preference Learning",
    description: "Over time, Eryx adapts to your coding style, preferred tools, and approach to problem-solving. It learns how you think.",
    tags: ["Style adaptation", "Preference retention", "Personalization"],
  },
  {
    icon: Brain,
    title: "Knowledge Graph",
    description: "Important concepts, references, and solutions are stored and connected. Eryx surfaces relevant knowledge when you need it.",
    tags: ["Concept linking", "Reference storage", "Contextual retrieval"],
  },
];

const capabilities = [
  {
    title: "Cross-session persistence",
    description: "Return days later and your projects, history, and preferences are exactly where you left them.",
  },
  {
    title: "Project-aware responses",
    description: "Eryx understands the context of your current project before responding, reducing irrelevant suggestions.",
  },
  {
    title: "Learns from feedback",
    description: "When you correct or guide Eryx, it remembers. Future responses align better with your expectations.",
  },
  {
    title: "Structured knowledge storage",
    description: "Memory isn't just conversation logs — it's structured, indexed, and retrievable by topic.",
  },
];

export default function MemoryPage() {
  return (
    <div className="bg-background text-foreground antialiased">
      {/* Hero */}
      <section className="relative py-36 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/3 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/8 mb-10">
            <Brain className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-semibold tracking-tight mb-5 leading-[1.15]">
            Memory that
            <br className="md:hidden" />
            <span className="text-muted-foreground"> persists</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Eryx remembers your projects, preferences, and past discussions. Context that survives across sessions.
          </p>
        </div>
      </section>

      {/* Memory Types */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-display font-semibold tracking-tight mb-12 text-center">
            What Eryx remembers
          </h2>
          <div className="space-y-5">
            {memoryTypes.map((type, i) => (
              <div key={i} className="p-6 rounded-xl border border-border/40 bg-card/50">
                <div className="flex items-start gap-5">
                  <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
                    <type.icon className="w-5 h-5 text-primary/70" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium mb-1">{type.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4">{type.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {type.tags.map((tag, j) => (
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

      {/* Capabilities */}
      <section className="py-24 px-6 border-t border-border/40">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-display font-semibold tracking-tight mb-12 text-center">
            How it manifests
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {capabilities.map((item, i) => (
              <div key={i} className="p-5 rounded-xl border border-border/30 bg-card/50">
                <h3 className="text-xs font-medium mb-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-24 px-6 border-t border-border/40">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-display font-semibold tracking-tight mb-12 text-center">
            The difference
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="p-6 rounded-xl border border-border/30">
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60 mb-4">Without persistent memory</h3>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Every conversation starts from zero</p>
                <p className="text-xs text-muted-foreground">Repetitive context setting</p>
                <p className="text-xs text-muted-foreground">Preferences forgotten each session</p>
              </div>
            </div>
            <div className="p-6 rounded-xl border border-primary/20 bg-primary/5">
              <h3 className="text-xs font-medium uppercase tracking-wider text-primary/60 mb-4">With Eryx memory</h3>
              <div className="space-y-2">
                <p className="text-xs text-foreground/80">Context carries across sessions</p>
                <p className="text-xs text-foreground/80">Projects and preferences persist</p>
                <p className="text-xs text-foreground/80">Eryx learns and adapts over time</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}