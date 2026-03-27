import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { getOrganicCompetitors } from "@/lib/semrush/client";
import type { Database } from "@/lib/semrush/constants";

const schema = z.object({
  domain: z.string().min(1),
  database: z.string().default("us"),
  limit: z.number().default(20),
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

    const competitors = await getOrganicCompetitors(domain, db, limit);

    return NextResponse.json({
      domain,
      competitors,
      total: competitors.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
