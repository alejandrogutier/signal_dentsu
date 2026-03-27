import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { getProjects, createProject } from "@/lib/db/queries";

const createSchema = z.object({
  name: z.string().min(1),
  domain: z.string().min(1),
  targetKeywords: z.array(z.string()).default([]),
  databaseRegion: z.string().default("us"),
  createdBy: z.string().default("system"),
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId") ?? "system";
    const projects = await getProjects(userId);
    return NextResponse.json({ projects });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = createSchema.parse(body);
    const project = await createProject(data);
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
