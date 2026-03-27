import { NextResponse } from "next/server";
import { getLoginUrl } from "@/lib/aws/cognito";

export async function GET() {
  try {
    const url = getLoginUrl();
    console.log("[auth/login] Redirecting to:", url);

    if (!url || !url.startsWith("https://")) {
      return NextResponse.json(
        {
          error: "Cognito not configured",
          debug: {
            COGNITO_DOMAIN: process.env.COGNITO_DOMAIN ? "set" : "MISSING",
            COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID ? "set" : "MISSING",
            NEXT_PUBLIC_COGNITO_REDIRECT_URI: process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI ? "set" : "MISSING",
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.redirect(url);
  } catch (error) {
    console.error("[auth/login] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
