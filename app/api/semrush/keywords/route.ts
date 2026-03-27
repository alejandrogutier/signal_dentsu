import { NextResponse } from "next/server";
import { z } from "zod/v4";
import {
  getKeywordOverview,
  getKeywordDifficulty,
  getKeywordOrganicResults,
  getRelatedKeywords,
  getQuestionKeywords,
} from "@/lib/semrush/client";
import type { Database } from "@/lib/semrush/constants";

const schema = z.object({
  keywords: z.array(z.string().min(1)).min(1).max(100),
  database: z.string().default("us"),
  action: z.enum(["overview", "difficulty", "organic", "related", "questions"]).default("overview"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { keywords, database, action } = schema.parse(body);
    const db = database as Database;

    switch (action) {
      case "overview": {
        const data = await getKeywordOverview(keywords, db);
        return NextResponse.json({ keywords: data });
      }
      case "difficulty": {
        const data = await getKeywordDifficulty(keywords, db);
        return NextResponse.json({ keywords: data });
      }
      case "organic": {
        // Only first keyword for organic results
        const data = await getKeywordOrganicResults(keywords[0], db);
        return NextResponse.json({ keyword: keywords[0], results: data });
      }
      case "related": {
        const data = await getRelatedKeywords(keywords[0], db);
        return NextResponse.json({ keyword: keywords[0], related: data });
      }
      case "questions": {
        const data = await getQuestionKeywords(keywords[0], db);
        return NextResponse.json({ keyword: keywords[0], questions: data });
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
