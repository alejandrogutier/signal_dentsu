import { NextResponse } from "next/server";
import { exchangeCode } from "@/lib/aws/cognito";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", request.url));
  }

  try {
    const tokens = await exchangeCode(code);
    const cookieStore = await cookies();

    cookieStore.set("id_token", tokens.idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: tokens.expiresIn,
      path: "/",
    });

    cookieStore.set("access_token", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: tokens.expiresIn,
      path: "/",
    });

    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch {
    return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
  }
}
