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
async function safe<T>(p: Promise<T>): Promise<T | null> {
  try {
    return await p;
  } catch (err) {
    console.warn("[semrush/domain] Non-fatal error:", err instanceof Error ? err.message : err);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { domain, database, limit } = schema.parse(body);
    const db = database as Database;

    const [rank, keywords, aiKeywords, backlinks, history] = await Promise.all([
      safe(getDomainRank(domain, db)),
      safe(getDomainOrganic(domain, db, limit)),
      safe(getDomainAiOverviewKeywords(domain, db, 20)),
      safe(getBacklinksOverview(domain)),
      safe(getDomainRankHistory(domain, db)),
    ]);

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
