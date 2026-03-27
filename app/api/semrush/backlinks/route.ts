import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { getBacklinksOverview } from "@/lib/semrush/client";

const schema = z.object({
  domain: z.string().min(1),
});

function cleanDomain(input: string): string {
  return input.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/+$/, "").trim();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.parse(body);
    const domain = cleanDomain(parsed.domain);

    const overview = await getBacklinksOverview(domain);

    if (!overview) {
      return NextResponse.json({ error: "No backlinks data found" }, { status: 404 });
    }

    return NextResponse.json({
      domain,
      ...overview,
      followRatio: overview.total > 0
        ? ((overview.followsNum / overview.total) * 100).toFixed(1)
        : "0",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
