import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { generateSeoAnalysis } from "@/lib/aws/bedrock";

const schema = z.object({
  domain: z.string().min(1),
  keywords: z.array(z.object({
    keyword: z.string(),
    position: z.number(),
    volume: z.number(),
    inAiOverview: z.boolean(),
  })),
  competitors: z.array(z.object({
    domain: z.string(),
    commonKeywords: z.number(),
  })),
  backlinks: z.object({
    total: z.number(),
    domains: z.number(),
  }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = schema.parse(body);

    const analysis = await generateSeoAnalysis(data);

    return NextResponse.json({ analysis });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
