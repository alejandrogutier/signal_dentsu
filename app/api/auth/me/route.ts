import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/aws/cognito";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const idToken = cookieStore.get("id_token")?.value;

    if (!idToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await verifyToken(idToken);
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
