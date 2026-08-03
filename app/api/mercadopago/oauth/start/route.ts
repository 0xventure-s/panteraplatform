import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { getAdminUserId } from "@/lib/admin";

export async function GET(request: NextRequest) {
  if (!(await getAdminUserId())) {
    return new NextResponse("No autorizado", { status: 401 });
  }

  const clientId = process.env.MERCADOPAGO_CLIENT_ID;
  const redirectUri = process.env.MERCADOPAGO_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.redirect(
      new URL("/admin/integraciones?error=configuracion", request.url),
    );
  }

  const state = crypto.randomBytes(32).toString("base64url");
  const codeVerifier = crypto.randomBytes(64).toString("base64url");
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");
  const authorizationUrl = new URL("https://auth.mercadopago.com/authorization");
  authorizationUrl.searchParams.set("client_id", clientId);
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("platform_id", "mp");
  authorizationUrl.searchParams.set("state", state);
  authorizationUrl.searchParams.set("redirect_uri", redirectUri);
  authorizationUrl.searchParams.set("code_challenge", codeChallenge);
  authorizationUrl.searchParams.set("code_challenge_method", "S256");

  const response = NextResponse.redirect(authorizationUrl);
  const secure = process.env.NODE_ENV === "production";

  response.cookies.set("mp_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    maxAge: 10 * 60,
    path: "/",
  });
  response.cookies.set("mp_oauth_verifier", codeVerifier, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    maxAge: 10 * 60,
    path: "/",
  });

  return response;
}
