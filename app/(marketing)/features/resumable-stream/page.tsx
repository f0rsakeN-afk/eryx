import { Metadata } from "next";
import { RefreshCw, Database, Wifi, Server } from "lucide-react";

export const metadata: Metadata = {
  title: "Resumable Stream | Eryx",
  description: "Never lose your place. Eryx resumable stream ensures uninterrupted conversations even if connections drop.",
  alternates: { canonical: "/features/resumable-stream" },
};

const phases = [
  {
    icon: Server,
    title: "Initialization",
    description: "Each stream receives a unique message ID with sequence tracking from the first byte sent.",
  },
  {
    icon: Wifi,
    title: "Chunk Delivery",
    description: "AI response streams in real-time. Each chunk is acknowledged and logged with position markers.",
  },
  {
    icon: Database,
    title: "Checkpointing",
    description: "Every position is saved to Redis. If the connection drops, Eryx knows exactly where to resume.",
  },
  {
    icon: RefreshCw,
    title: "Recovery",
    description: "Client re-requests from last checkpoint. Server validates and re-streams from the exact position.",
  },
];

const guarantees = [
  {
    title: "Connection Drops",
    description: "Auto-reconnect resumes from exact position. No re-generation, no data loss.",
  },
  {
    title: "Browser Close",
    description: "Return hours later. The stream state is preserved, waiting for you.",
  },
  {
    title: "Cross-device Sessions",
    description: "Start on laptop, continue on phone. Stream state syncs across devices.",
  },
  {
    title: "Server Validation",
    description: "Every chunk is logged server-side. Resume always starts from a verified checkpoint.",
  },
  {
    title: "Efficient Recovery",
    description: "Re-streaming without re-computation. Recovery is nearly instant.",
  },
  {
    title: "No Lost Work",
    description: "Prompts never need re-typing. Generated code survives any disruption.",
  },
];

export default function ResumableStreamPage() {
  return (
    <div className="bg-background text-foreground antialiased">
      {/* Hero */}
      <section className="relative py-36 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/3 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/8 mb-10">
            <RefreshCw className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-semibold tracking-tight mb-5 leading-[1.15]">
            Stream with
            <br className="md:hidden" />
            <span className="text-muted-foreground"> confidence</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Disconnects, browser closes, network issues — none of it matters. Every stream is checkpointed and resumable.
          </p>
        </div>
      </section>

      {/* Visual */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl border border-border/60 bg-muted/5 overflow-hidden">
            <div className="aspect-[16/9] flex items-center justify-center">
              <p className="text-xs text-muted-foreground/40 uppercase tracking-widest">Architecture Preview</p>
            </div>
          </div>
        </div>
      </section>

      {/* Phases */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-display font-semibold tracking-tight mb-12 text-center">
            Four-phase architecture
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {phases.map((phase, i) => (
              <div key={i} className="p-6 rounded-xl border border-border/40 bg-card/50">
                <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center mb-4">
                  <phase.icon className="w-4 h-4 text-primary/70" />
                </div>
                <h3 className="text-sm font-medium mb-2">{phase.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{phase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantees */}
      <section className="py-24 px-6 border-t border-border/40">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-display font-semibold tracking-tight mb-12 text-center">
            What this means for you
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {guarantees.map((item, i) => (
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
            The contrast
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="p-6 rounded-xl border border-border/30">
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60 mb-4">Traditional streaming</h3>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Connection drop = start over</p>
                <p className="text-xs text-muted-foreground">Browser close = lose response</p>
                <p className="text-xs text-muted-foreground">No server checkpoints</p>
                <p className="text-xs text-muted-foreground">Full re-generation on retry</p>
              </div>
            </div>
            <div className="p-6 rounded-xl border border-primary/20 bg-primary/5">
              <h3 className="text-xs font-medium uppercase tracking-wider text-primary/60 mb-4">Eryx resumable stream</h3>
              <div className="space-y-2">
                <p className="text-xs text-foreground/80">Auto-resume from exact position</p>
                <p className="text-xs text-foreground/80">Survives browser close</p>
                <p className="text-xs text-foreground/80">Redis-backed checkpoint state</p>
                <p className="text-xs text-foreground/80">Re-stream without re-compute</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}