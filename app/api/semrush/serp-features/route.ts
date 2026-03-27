import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { getDomainOrganic, getDomainAiOverviewKeywords } from "@/lib/semrush/client";
import { AI_SERP_FEATURES, SERP_FEATURES } from "@/lib/semrush/constants";
import type { Database } from "@/lib/semrush/constants";

const schema = z.object({
  domain: z.string().min(1),
  database: z.string().default("us"),
  limit: z.number().default(100),
});

function cleanDomain(input: string): string {
  return input.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/+$/, "").trim();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.parse(body);
    const domain = cleanDomain(parsed.domain);
    const db = parsed.database as Database;
    const limit = parsed.limit;

    const [allKeywords, aiKeywords] = await Promise.all([
      getDomainOrganic(domain, db, limit),
      getDomainAiOverviewKeywords(domain, db, limit),
    ]);

    // Count SERP feature occurrences
    const featureCounts: Record<string, number> = {};
    for (const kw of allKeywords) {
      for (const feat of kw.serpFeatures) {
        featureCounts[feat] = (featureCounts[feat] ?? 0) + 1;
      }
    }

    // Build feature summary with labels
    const featureSummary = Object.entries(featureCounts)
      .map(([code, count]) => ({
        code,
        label: SERP_FEATURES[code as keyof typeof SERP_FEATURES] ?? code,
        count,
        isAiFeature: AI_SERP_FEATURES.includes(code as typeof AI_SERP_FEATURES[number]),
      }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      domain,
      totalKeywordsAnalyzed: allKeywords.length,
      aiOverviewKeywords: aiKeywords,
      aiOverviewCount: aiKeywords.length,
      featureSummary,
      aiFeatures: featureSummary.filter((f) => f.isAiFeature),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
