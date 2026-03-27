import { NextResponse } from "next/server";
import { z } from "zod/v4";

const schema = z.object({
  url: z.url(),
});

interface AuditCheck {
  id: string;
  category: string;
  name: string;
  passed: boolean;
  details: string;
}

/** Fetch a URL with timeout */
async function safeFetch(url: string, timeout = 10_000): Promise<Response | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const res = await fetch(url, { signal: controller.signal, redirect: "follow" });
    clearTimeout(timer);
    return res;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = schema.parse(body);
    const target = new URL(url);
    const checks: AuditCheck[] = [];

    // Fetch all resources in parallel
    const [pageRes, llmsTxt, robotsTxt, sitemapXml] = await Promise.all([
      safeFetch(url),
      safeFetch(`${target.origin}/llms.txt`),
      safeFetch(`${target.origin}/robots.txt`),
      safeFetch(`${target.origin}/sitemap.xml`),
    ]);

    const pageHtml = pageRes ? await pageRes.text() : "";

    // ── Discovery ────────────────────────────────────
    checks.push({
      id: "llms-txt",
      category: "Discovery",
      name: "llms.txt",
      passed: llmsTxt?.ok ?? false,
      details: llmsTxt?.ok ? "llms.txt found" : "No llms.txt file",
    });

    checks.push({
      id: "robots-txt",
      category: "Discovery",
      name: "robots.txt",
      passed: robotsTxt?.ok ?? false,
      details: robotsTxt?.ok ? "robots.txt found" : "No robots.txt",
    });

    const hasAiBotAccess = robotsTxt?.ok
      ? !(await robotsTxt.text()).match(/Disallow:.*\/(.*\n)*.*User-agent:\s*(GPTBot|ChatGPT|Google-Extended|Anthropic|ClaudeBot|PerplexityBot)/i)
      : false;
    checks.push({
      id: "ai-bot-access",
      category: "Discovery",
      name: "AI Bot Access",
      passed: hasAiBotAccess,
      details: hasAiBotAccess ? "AI bots not blocked" : "Some AI bots may be blocked in robots.txt",
    });

    checks.push({
      id: "sitemap",
      category: "Discovery",
      name: "XML Sitemap",
      passed: sitemapXml?.ok ?? false,
      details: sitemapXml?.ok ? "Sitemap found" : "No sitemap.xml",
    });

    // ── Structure ────────────────────────────────────
    const hasJsonLd = pageHtml.includes('type="application/ld+json"') || pageHtml.includes("type='application/ld+json'");
    checks.push({ id: "json-ld", category: "Structure", name: "JSON-LD Schema", passed: hasJsonLd, details: hasJsonLd ? "Structured data found" : "No JSON-LD schema detected" });

    const hasFaqSchema = pageHtml.includes("FAQPage") || pageHtml.includes("Question");
    checks.push({ id: "faq-schema", category: "Structure", name: "FAQ/Q&A Schema", passed: hasFaqSchema, details: hasFaqSchema ? "FAQ schema found" : "No FAQ schema" });

    const hasOg = pageHtml.includes('property="og:');
    checks.push({ id: "og-tags", category: "Structure", name: "Open Graph Tags", passed: hasOg, details: hasOg ? "OG tags found" : "No Open Graph tags" });

    const hasMeta = pageHtml.includes('name="description"');
    checks.push({ id: "meta-desc", category: "Structure", name: "Meta Description", passed: hasMeta, details: hasMeta ? "Meta description found" : "No meta description" });

    const hasCanonical = pageHtml.includes('rel="canonical"');
    checks.push({ id: "canonical", category: "Structure", name: "Canonical Tag", passed: hasCanonical, details: hasCanonical ? "Canonical tag found" : "No canonical tag" });

    // ── Content ──────────────────────────────────────
    const textContent = pageHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    const wordCount = textContent.split(" ").filter(Boolean).length;
    checks.push({ id: "content-length", category: "Content", name: "Content Length", passed: wordCount >= 300, details: `${wordCount} words (min 300)` });

    const hasH1 = pageHtml.includes("<h1");
    checks.push({ id: "heading", category: "Content", name: "H1 Heading", passed: hasH1, details: hasH1 ? "H1 found" : "No H1 heading" });

    // ── Technical ────────────────────────────────────
    checks.push({ id: "https", category: "Technical", name: "HTTPS", passed: target.protocol === "https:", details: target.protocol === "https:" ? "Using HTTPS" : "Not using HTTPS" });

    const pageSize = new Blob([pageHtml]).size;
    checks.push({ id: "page-size", category: "Technical", name: "Page Size", passed: pageSize < 500_000, details: `${(pageSize / 1024).toFixed(0)}KB (max 500KB)` });

    const hasLang = pageHtml.includes('lang="') || pageHtml.includes("lang='");
    checks.push({ id: "lang", category: "Technical", name: "Language Attribute", passed: hasLang, details: hasLang ? "Language attribute found" : "No lang attribute" });

    // Score
    const passed = checks.filter((c) => c.passed).length;
    const score = Math.round((passed / checks.length) * 100);

    return NextResponse.json({
      url,
      score,
      totalChecks: checks.length,
      passed,
      failed: checks.length - passed,
      checks,
      categories: [...new Set(checks.map((c) => c.category))].map((cat) => {
        const catChecks = checks.filter((c) => c.category === cat);
        return {
          name: cat,
          passed: catChecks.filter((c) => c.passed).length,
          total: catChecks.length,
        };
      }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
