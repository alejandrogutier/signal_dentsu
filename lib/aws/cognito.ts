/**
 * AWS Cognito authentication helpers
 *
 * Uses the OAuth 2.0 Authorization Code flow with Cognito Hosted UI.
 * Tokens are verified using jose (JWT library) with JWKS from Cognito.
 */

import * as jose from "jose";

const CLIENT_ID = process.env.COGNITO_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.COGNITO_CLIENT_SECRET ?? "";
const ISSUER = process.env.COGNITO_ISSUER ?? "";
const DOMAIN = process.env.COGNITO_DOMAIN ?? "";
const REDIRECT_URI = process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI ?? "";

let jwks: jose.JWTVerifyGetKey | null = null;

function getJwks(): jose.JWTVerifyGetKey {
  if (!jwks) {
    const jwksUrl = new URL("/.well-known/jwks.json", ISSUER);
    jwks = jose.createRemoteJWKSet(jwksUrl);
  }
  return jwks;
}

/** Build the Cognito Hosted UI login URL */
export function getLoginUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    scope: "openid email profile",
    redirect_uri: REDIRECT_URI,
  });
  if (state) params.set("state", state);
  return `${DOMAIN}/oauth2/authorize?${params}`;
}

/** Exchange authorization code for tokens */
export async function exchangeCode(code: string): Promise<{
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

  const res = await fetch(`${DOMAIN}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cognito token exchange failed: ${text}`);
  }

  const data = await res.json();
  return {
    accessToken: data.access_token,
    idToken: data.id_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

/** Verify and decode an ID token */
export async function verifyToken(token: string): Promise<{
  sub: string;
  email: string;
  name: string;
}> {
  const { payload } = await jose.jwtVerify(token, getJwks(), {
    issuer: ISSUER,
    audience: CLIENT_ID,
  });

  return {
    sub: payload.sub ?? "",
    email: (payload.email as string) ?? "",
    name: (payload.name as string) ?? (payload["cognito:username"] as string) ?? "",
  };
}

/** Build logout URL */
export function getLogoutUrl(): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    logout_uri: REDIRECT_URI.replace("/api/auth/callback", "/login"),
  });
  return `${DOMAIN}/logout?${params}`;
}
