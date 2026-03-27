import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { saveSnapshot, getSnapshots } from "@/lib/db/queries";

const createSchema = z.object({
  projectId: z.string().uuid(),
  snapshotType: z.string().min(1),
  payload: z.record(z.string(), z.unknown()),
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId");
    const type = url.searchParams.get("type") ?? undefined;

    if (!projectId) {
      return NextResponse.json({ error: "projectId required" }, { status: 400 });
    }

    const snapshots = await getSnapshots(projectId, type);
    return NextResponse.json({ snapshots });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = createSchema.parse(body);
    const snapshot = await saveSnapshot(data);
    return NextResponse.json({ snapshot }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
