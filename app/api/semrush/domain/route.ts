import { NextResponse } from "next/server";
import { z } from "zod/v4";
import {
  getDomainOrganic,
  getDomainRank,
  getDomainRankHistory,
  getDomainAiOverviewKeywords,
  getBacklinksOverview,
} from "@/lib/semrush/client";
import type { Database } from "@/lib/semrush/constants";

const schema = z.object({
  domain: z.string().min(1),
  database: z.string().default("us"),
  limit: z.number().default(50),
});

/** Wrap a promise so it returns null on error instead of rejecting */
async function safe<T>(label: string, p: Promise<T>): Promise<T | null> {
  try {
    return await p;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[semrush/domain] ${label} failed: ${msg}`);
    // If it's "NOTHING FOUND" that's expected for some databases - return null
    // For other errors, still log but don't crash
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { domain, database, limit } = schema.parse(body);
    const db = database as Database;

    console.log(`[semrush/domain] Analyzing domain=${domain} db=${db} limit=${limit}`);

    const [rank, keywords, aiKeywords, backlinks, history] = await Promise.all([
      safe("getDomainRank", getDomainRank(domain, db)),
      safe("getDomainOrganic", getDomainOrganic(domain, db, limit)),
      safe("getDomainAiOverviewKeywords", getDomainAiOverviewKeywords(domain, db, 20)),
      safe("getBacklinksOverview", getBacklinksOverview(domain)),
      safe("getDomainRankHistory", getDomainRankHistory(domain, db)),
    ]);

    console.log(`[semrush/domain] Results: rank=${!!rank} keywords=${keywords?.length ?? 0} ai=${aiKeywords?.length ?? 0} backlinks=${!!backlinks} history=${history?.length ?? 0}`);

    return NextResponse.json({
      domain,
      rank,
      keywords: keywords ?? [],
      aiOverviewKeywords: aiKeywords ?? [],
      backlinks,
      history: history ?? [],
      summary: {
        organicKeywords: rank?.organicKeywords ?? 0,
        organicTraffic: rank?.organicTraffic ?? 0,
        aiOverviewCount: aiKeywords?.length ?? 0,
        totalBacklinks: backlinks?.total ?? 0,
        referringDomains: backlinks?.domainsNum ?? 0,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
