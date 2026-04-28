import type { Metadata } from "next";
import Link from "next/link";
import { ChangelogList } from "@/components/plain/changelog/changelog-list";
import type { ChangelogEntry, ChangeType } from "@/types/changelog";

export const metadata: Metadata = {
  title: "Changelog",
  description:
    "Every update, fix, and new feature — in one place. We ship continuously and keep this page up to date.",
  alternates: {
    canonical: "/changelog",
  },
  openGraph: {
    title: "Changelog | Eryx",
    description:
      "Every update, fix, and new feature — in one place. We ship continuously and keep this page up to date.",
    url: "/changelog",
    type: "website",
  },
};

interface PageProps {
  searchParams: Promise<{ search?: string; cursor?: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

async function getChangelogEntries(searchParams: PageProps["searchParams"]) {
  const sp = await searchParams;
  const search = sp.search?.trim() || undefined;
  const cursor = sp.cursor || undefined;

  const url = new URL(`${SITE_URL}/api/changelog`);
  url.searchParams.set("limit", "10");
  if (search) url.searchParams.set("search", search);
  if (cursor) url.searchParams.set("cursor", cursor);

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function ChangelogJsonLd({ entries }: { entries: ChangelogEntry[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Eryx Changelog",
    description: "Release history for Eryx",
    itemListElement: entries.map((entry, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `v${entry.version} — ${entry.title}`,
      description: entry.description,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function ChangelogPage({ searchParams }: PageProps) {
  const result = (await getChangelogEntries(searchParams)) ?? {
    data: [] as ChangelogEntry[],
    hasMore: false,
    search: undefined,
  };

  const entries = result.data as ChangelogEntry[];
  const hasMore = result.hasMore as boolean;
  const search = result.search as string | undefined;
  const nextCursor = result.nextCursor as string | undefined;
  const hasSearch = !!search;

  return (
    <>
      <ChangelogJsonLd entries={entries} />

      <div className="min-h-dvh bg-background text-foreground">
        <div className="max-w-5xl mx-auto px-6 py-12 lg:py-16">
          <div className="mb-12 lg:mb-16">
            <h1 className="text-3xl font-display font-semibold tracking-tight text-foreground">
              Changelog
            </h1>
            <p className="mt-3 text-base text-muted-foreground leading-relaxed max-w-xl">
              Every update, fix, and new feature — in one place. We ship
              continuously and keep this page up to date.
            </p>
          </div>

          {/* Search bar */}
          <form method="GET" action="/changelog" className="flex items-center gap-3 mb-10">
            <div className="relative w-full sm:w-80">
              <svg
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Search releases, features, fixes…"
                className="pl-8 pr-4 py-2 w-full text-sm bg-muted border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
                aria-label="Search changelog"
              />
            </div>
            {hasSearch && (
              <Link href="/changelog" className="text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0">
                Clear
              </Link>
            )}
          </form>

          {entries.length > 0 ? (
            <>
              <ChangelogList entries={entries} />

              {/* Cursor-based pagination */}
              {hasMore && (
                <div className="flex items-center justify-center mt-12">
                  <Link
                    href={`/changelog?cursor=${nextCursor}${search ? `&search=${search}` : ""}`}
                    className="px-6 py-2.5 text-sm border border-border rounded-lg hover:bg-muted transition-colors font-medium"
                  >
                    Load more
                  </Link>
                </div>
              )}
            </>
          ) : !hasSearch ? (
            <div className="py-16 flex flex-col items-center gap-3 text-center">
              <svg className="w-8 h-8 text-muted-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V9a2 2 0 012-2h2a2 2 0 012 2v9a2 2 0 01-2 2h-2z" />
              </svg>
              <p className="text-sm font-medium text-foreground">No releases yet</p>
              <p className="text-sm text-muted-foreground">Check back soon.</p>
            </div>
          ) : (
            <div className="py-16 flex flex-col items-center gap-3 text-center">
              <svg className="w-8 h-8 text-muted-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-sm font-medium text-foreground">No results for &ldquo;{search}&rdquo;</p>
              <p className="text-sm text-muted-foreground">Try a version number, feature name, or keyword.</p>
              <Link href="/changelog" className="mt-1 text-sm text-foreground underline underline-offset-4 hover:text-muted-foreground">
                Clear search
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}