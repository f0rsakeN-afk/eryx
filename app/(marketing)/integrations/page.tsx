import { Metadata } from "next";
import { Puzzle, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Integrations | Eryx",
  description: "Connect Eryx with the tools you already use. GitHub, Linear, Notion, Stripe, and 50+ more integrations via MCP.",
  alternates: { canonical: "/integrations" },
};

const categories = [
  {
    name: "Development",
    slug: "dev",
    description: "Tools for developers",
  },
  {
    name: "Productivity",
    slug: "productivity",
    description: "Work smarter, not harder",
  },
  {
    name: "Design",
    slug: "design",
    description: "Creative tools",
  },
  {
    name: "Database",
    slug: "database",
    description: "Data infrastructure",
  },
  {
    name: "CRM",
    slug: "crm",
    description: "Customer relationships",
  },
  {
    name: "Payments",
    slug: "payments",
    description: "Financial tools",
  },
  {
    name: "Search",
    slug: "search",
    description: "Discovery & research",
  },
];

const featuredIntegrations = [
  { name: "GitHub", category: "dev", featured: true },
  { name: "Vercel", category: "dev", featured: true },
  { name: "Context7", category: "dev", featured: true },
  { name: "Linear", category: "productivity", featured: true },
  { name: "Notion", category: "productivity", featured: true },
  { name: "Slack", category: "productivity", featured: true },
  { name: "Stripe", category: "payments", featured: true },
  { name: "Supabase", category: "database", featured: true },
];

export default function IntegrationsPage() {
  return (
    <div className="bg-background text-foreground antialiased">
      {/* Hero */}
      <section className="relative py-36 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/3 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/8 mb-10">
            <Puzzle className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-semibold tracking-tight mb-5 leading-[1.15]">
            Connect everything,
            <br className="md:hidden" />
            <span className="text-muted-foreground"> work seamlessly</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Eryx connects to 50+ tools via MCP. Bring your GitHub, Linear, Notion — and more — directly into your workflow.
          </p>
        </div>
      </section>

      {/* Featured Integrations */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-display font-semibold tracking-tight mb-8 text-center">
            Featured integrations
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredIntegrations.map((integration, i) => (
              <div
                key={i}
                className="p-5 rounded-xl border border-border/40 bg-card/50 hover:border-primary/20 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center mb-3">
                  <span className="text-sm font-medium text-primary/70">{integration.name[0]}</span>
                </div>
                <p className="text-sm font-medium">{integration.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5 capitalize">{integration.category}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-6 border-t border-border/40">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-display font-semibold tracking-tight mb-8 text-center">
            Browse by category
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category, i) => (
              <a
                key={i}
                href={`#${category.slug}`}
                className="p-6 rounded-xl border border-border/40 bg-card/50 hover:bg-muted/30 transition-colors group"
              >
                <h3 className="text-sm font-medium mb-1 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-xs text-muted-foreground">{category.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* How MCP Works */}
      <section className="py-24 px-6 border-t border-border/40">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-display font-semibold tracking-tight mb-12 text-center">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-border/40 bg-card/50">
              <span className="text-xs font-medium text-primary/60 mb-3 block">01</span>
              <h3 className="text-sm font-medium mb-2">Browse integrations</h3>
              <p className="text-xs text-muted-foreground">Explore available MCP tools and find what you need.</p>
            </div>
            <div className="p-6 rounded-xl border border-border/40 bg-card/50">
              <span className="text-xs font-medium text-primary/60 mb-3 block">02</span>
              <h3 className="text-sm font-medium mb-2">Connect your account</h3>
              <p className="text-xs text-muted-foreground">Authenticate with OAuth or API key. Eryx handles secure storage.</p>
            </div>
            <div className="p-6 rounded-xl border border-border/40 bg-card/50">
              <span className="text-xs font-medium text-primary/60 mb-3 block">03</span>
              <h3 className="text-sm font-medium mb-2">Use in conversations</h3>
              <p className="text-xs text-muted-foreground">Access tools directly in chat. Eryx handles the complexity.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="py-24 px-6 border-t border-border/40">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-display font-semibold tracking-tight mb-4">
            More integrations coming
          </h2>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            We&apos;re constantly adding new integrations. Have a request? Let us know what tools would make your workflow better.
          </p>
        </div>
      </section>
    </div>
  );
}