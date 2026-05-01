import { Metadata } from "next";
import { Search, Quote, Globe, Clock, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Web Search | Eryx",
  description: "Real-time web search powered by RAG. Get accurate, up-to-date answers with citations.",
  alternates: { canonical: "/features/web-search" },
};

const coreFeatures = [
  {
    icon: Quote,
    title: "Verified Citations",
    description: "Every answer includes source attribution. Hover to preview, click to visit. No more wondering if the information is accurate.",
  },
  {
    icon: Globe,
    title: "Global Coverage",
    description: "Access the entire web, not a limited index. Real-time crawling means you get current information, not last month's.",
  },
  {
    icon: Zap,
    title: "Sub-second Retrieval",
    description: "RAG-powered search delivers relevant results in milliseconds without sacrificing accuracy or depth.",
  },
  {
    icon: Clock,
    title: "Freshness Timestamp",
    description: "Always know when information was retrieved. No more stale answers from outdated indexes.",
  },
];

const scenarios = [
  {
    title: "Research & Due Diligence",
    description: "Validate technical decisions with real-world examples. Compare architectures, understand trade-offs, back up choices with current best practices.",
  },
  {
    title: "Debug with Confidence",
    description: "Find relevant GitHub issues, Stack Overflow threads, and official documentation in one place. Solutions verified by the community.",
  },
  {
    title: "Track Emerging Technologies",
    description: "Monitor new releases, understand competitor positioning, and stay ahead of industry shifts with real-time data.",
  },
];

export default function WebSearchPage() {
  return (
    <div className="bg-background text-foreground antialiased">
      {/* Hero */}
      <section className="relative py-36 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/3 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/8 mb-10">
            <Search className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-semibold tracking-tight mb-5 leading-[1.15]">
            Web Search,
            <br className="md:hidden" />
            <span className="text-muted-foreground"> Reimagined</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            RAG-powered answers with citations. Not just links — direct, verifiable information from across the web.
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

      {/* Core Features */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-display font-semibold tracking-tight mb-12 text-center">
            The difference is in the details
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {coreFeatures.map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-xl border border-border/40 bg-card/50"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center mb-4">
                  <feature.icon className="w-4 h-4 text-primary/70" />
                </div>
                <h3 className="text-sm font-medium mb-2">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scenarios */}
      <section className="py-24 px-6 border-t border-border/40">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-display font-semibold tracking-tight mb-12 text-center">
            For how you actually work
          </h2>
          <div className="space-y-4">
            {scenarios.map((scenario, i) => (
              <div
                key={i}
                className="p-6 rounded-xl border border-border/30 bg-muted/5"
              >
                <h3 className="text-sm font-medium mb-2">{scenario.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{scenario.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-24 px-6 border-t border-border/40">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-display font-semibold tracking-tight mb-12 text-center">
            The contrast is clear
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-border/30">
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60 mb-5">Before</h3>
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Hours navigating through links</p>
                <p className="text-xs text-muted-foreground">Outdated results from stale indexes</p>
                <p className="text-xs text-muted-foreground">No way to verify accuracy</p>
              </div>
            </div>
            <div className="p-6 rounded-xl border border-primary/20 bg-primary/5">
              <h3 className="text-xs font-medium uppercase tracking-wider text-primary/60 mb-5">With Eryx</h3>
              <div className="space-y-3">
                <p className="text-xs text-foreground/80">Direct answers with sources</p>
                <p className="text-xs text-foreground/80">Real-time data, timestamped</p>
                <p className="text-xs text-foreground/80">Every claim has a citation</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}