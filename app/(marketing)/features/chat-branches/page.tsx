import { Metadata } from "next";
import { GitBranch, ArrowRight, Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Chat Branches | Eryx",
  description: "Explore multiple directions in your conversations without losing context. Chat branches let you diverged and merge conversations.",
  alternates: { canonical: "/features/chat-branches" },
};

const benefits = [
  {
    title: "Non-destructive exploration",
    description: "Try different approaches without abandoning your main thread. Each branch is independent and persistent.",
  },
  {
    title: "Context preservation",
    description: "All branches share the same conversation history up to the fork point. No redundant context setting.",
  },
  {
    title: "Easy comparison",
    description: "Compare outputs from different approaches side by side. Decide which path works best for your use case.",
  },
  {
    title: "Merge insights",
    description: "When you find useful code or ideas in a branch, incorporate them back into your main conversation.",
  },
];

const useCases = [
  {
    title: "Debugging alternatives",
    description: "Try multiple solutions to the same problem in parallel. Keep the one that works best.",
  },
  {
    title: "Design exploration",
    description: "Discuss different architectural approaches without derailing your primary investigation.",
  },
  {
    title: "Learning variations",
    description: "When explaining a concept, explore multiple analogies until you find the one that clicks.",
  },
  {
    title: "Code review paths",
    description: "Branch off to explore suggested improvements without modifying the original implementation.",
  },
];

export default function ChatBranchesPage() {
  return (
    <div className="bg-background text-foreground antialiased">
      {/* Hero */}
      <section className="relative py-36 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/3 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/8 mb-10">
            <GitBranch className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-semibold tracking-tight mb-5 leading-[1.15]">
            One conversation,
            <br className="md:hidden" />
            <span className="text-muted-foreground"> many directions</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Branch off to explore different paths without losing your main thread. Non-destructive, persistent, and easy to compare.
          </p>
        </div>
      </section>

      {/* Visual */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl border border-border/60 bg-muted/5 overflow-hidden">
            <div className="aspect-[16/9] flex items-center justify-center">
              <p className="text-xs text-muted-foreground/40 uppercase tracking-widest">Preview</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-display font-semibold tracking-tight mb-12 text-center">
            Why branches matter
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {benefits.map((benefit, i) => (
              <div key={i} className="p-6 rounded-xl border border-border/40 bg-card/50">
                <h3 className="text-sm font-medium mb-2">{benefit.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 px-6 border-t border-border/40">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-display font-semibold tracking-tight mb-12 text-center">
            How you would use it
          </h2>
          <div className="space-y-4">
            {useCases.map((useCase, i) => (
              <div key={i} className="p-6 rounded-xl border border-border/30 bg-card/50">
                <h3 className="text-sm font-medium mb-2">{useCase.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-24 px-6 border-t border-border/40">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-display font-semibold tracking-tight mb-12 text-center">
            The contrast
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="p-6 rounded-xl border border-border/30">
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60 mb-4">Linear chat</h3>
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Exploring alternatives derails the main thread</p>
                <p className="text-xs text-muted-foreground">Must re-explain context when returning to a topic</p>
                <p className="text-xs text-muted-foreground">Comparing solutions requires separate conversations</p>
              </div>
            </div>
            <div className="p-6 rounded-xl border border-primary/20 bg-primary/5">
              <h3 className="text-xs font-medium uppercase tracking-wider text-primary/60 mb-4">With branches</h3>
              <div className="space-y-3">
                <p className="text-xs text-foreground/80">Every path is saved and accessible</p>
                <p className="text-xs text-foreground/80">Context preserved up to each fork point</p>
                <p className="text-xs text-foreground/80">Switch between branches freely</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}