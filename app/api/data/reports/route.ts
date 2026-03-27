import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { saveReport, getReports } from "@/lib/db/queries";

const createSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1),
  reportType: z.string().min(1),
  content: z.record(z.string(), z.unknown()),
  llmAnalysis: z.string().optional(),
  createdBy: z.string().default("system"),
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "projectId required" }, { status: 400 });
    }

    const reports = await getReports(projectId);
    return NextResponse.json({ reports });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = createSchema.parse(body);
    const report = await saveReport(data);
    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
