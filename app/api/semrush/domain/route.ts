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

/** GET /api/semrush/domain — Full domain overview */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { domain, database, limit } = schema.parse(body);
    const db = database as Database;

    const [rank, keywords, aiKeywords, backlinks, history] = await Promise.all([
      getDomainRank(domain, db),
      getDomainOrganic(domain, db, limit),
      getDomainAiOverviewKeywords(domain, db, 20),
      getBacklinksOverview(domain),
      getDomainRankHistory(domain, db),
    ]);

    return NextResponse.json({
      domain,
      rank,
      keywords,
      aiOverviewKeywords: aiKeywords,
      backlinks,
      history,
      summary: {
        organicKeywords: rank?.organicKeywords ?? 0,
        organicTraffic: rank?.organicTraffic ?? 0,
        aiOverviewCount: aiKeywords.length,
        totalBacklinks: backlinks?.total ?? 0,
        referringDomains: backlinks?.domainsNum ?? 0,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
