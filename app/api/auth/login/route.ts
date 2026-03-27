import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const CLIENT_ID = process.env.COGNITO_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.COGNITO_CLIENT_SECRET ?? "";
const REGION = process.env.APP_AWS_REGION ?? "us-east-1";
const USER_POOL_ID = process.env.COGNITO_ISSUER?.split("/").pop() ?? "";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    // Compute SECRET_HASH
    const crypto = await import("crypto");
    const secretHash = crypto
      .createHmac("sha256", CLIENT_SECRET)
      .update(email + CLIENT_ID)
      .digest("base64");

    // Call Cognito InitiateAuth directly
    const res = await fetch(
      `https://cognito-idp.${REGION}.amazonaws.com/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-amz-json-1.1",
          "X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth",
        },
        body: JSON.stringify({
          AuthFlow: "USER_PASSWORD_AUTH",
          ClientId: CLIENT_ID,
          AuthParameters: {
            USERNAME: email,
            PASSWORD: password,
            SECRET_HASH: secretHash,
          },
        }),
      }
    );

    const data = await res.json();

    if (data.__type?.includes("NotAuthorizedException")) {
      return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 });
    }

    if (data.__type?.includes("NewPasswordRequired") || data.ChallengeName === "NEW_PASSWORD_REQUIRED") {
      return NextResponse.json({ error: "Password change required", challengeName: "NEW_PASSWORD_REQUIRED" }, { status: 403 });
    }

    if (!data.AuthenticationResult) {
      return NextResponse.json({ error: data.message || "Authentication failed" }, { status: 401 });
    }

    const { IdToken, AccessToken, ExpiresIn } = data.AuthenticationResult;

    const cookieStore = await cookies();

    cookieStore.set("id_token", IdToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: ExpiresIn,
      path: "/",
    });

    cookieStore.set("access_token", AccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: ExpiresIn,
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[auth/login] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
