import { NextResponse } from "next/server";
import { getLoginUrl } from "@/lib/aws/cognito";

export async function GET() {
  const url = getLoginUrl();
  return NextResponse.redirect(url);
}
