/**
 * Content Scraper
 * Fetches and extracts clean text content from URLs
 */

import * as cheerio from "cheerio";

const SCRAPE_TIMEOUT = 10000; // 10 seconds

export interface ScrapedContent {
  url: string;
  title: string;
  content: string;
  excerpt: string;
  error?: string;
}

/**
 * Extract clean text content from a URL
 */
export async function scrapeUrl(url: string): Promise<ScrapedContent> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), SCRAPE_TIMEOUT);

    const response = await fetch(url, {
      headers: {
        "Accept": "text/html,application/xhtml+xml",
        "User-Agent": "Mozilla/5.0 (compatible; Eryx/1.0; +https://eryx.ai)",
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove script, style, nav, footer, header elements
    $("script, style, nav, footer, header, aside, [role='navigation'], [role='banner'], [role='contentinfo'], .sidebar, .ad, .advertisement, .social-share, .comments").remove();

    // Get title
    const title = $("title").text().trim() ||
      $("meta[property='og:title']").attr("content")?.trim() ||
      $("h1").first().text().trim() ||
      "";

    // Get main content - try common selectors
    let content = "";

    // Try article tag first
    if ($("article").length) {
      content = $("article").first().text();
    }
    // Try main tag
    else if ($("main").length) {
      content = $("main").first().text();
    }
    // Try content divs
    else if ($(".content, #content, .post, .article, .entry").length) {
      content = $(".content, #content, .post, .article, .entry").first().text();
    }
    // Fallback to body
    else {
      content = $("body").text();
    }

    // Clean up content
    content = content
      .replace(/\s+/g, " ") // Collapse whitespace
      .replace(/\n+/g, " ") // Remove newlines
      .replace(/hidden=""|style="display:\s*none"/g, "") // Remove hidden elements text
      .trim();

    // Create excerpt (first 300 chars)
    const excerpt = content.slice(0, 300).trim() + (content.length > 300 ? "..." : "");

    return {
      url,
      title: title.slice(0, 200),
      content: content.slice(0, 5000), // Limit content to 5000 chars
      excerpt,
    };
  } catch (error) {
    return {
      url,
      title: "",
      content: "",
      excerpt: "",
      error: error instanceof Error ? error.message : "Failed to fetch",
    };
  }
}

/**
 * Scrape multiple URLs in parallel
 */
export async function scrapeUrls(urls: string[], concurrency = 3): Promise<ScrapedContent[]> {
  const results: ScrapedContent[] = [];

  // Process in batches to avoid overwhelming the server
  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map((url) => scrapeUrl(url)));
    results.push(...batchResults);
  }

  return results;
}
