import { NextRequest, NextResponse } from "next/server";

import { getAdminUserId } from "@/lib/admin";
import { exchangeOAuthCode, saveMercadoPagoConnection } from "@/lib/mercado-pago";

const redirectToIntegrations = (request: NextRequest, query: string) => {
  const response = NextResponse.redirect(new URL(`/admin/integraciones?${query}`, request.url));
  response.cookies.set("mp_oauth_state", "", { maxAge: 0, path: "/" });
  response.cookies.set("mp_oauth_verifier", "", { maxAge: 0, path: "/" });
  return response;
};

export async function GET(request: NextRequest) {
  const adminUserId = await getAdminUserId();

  if (!adminUserId) {
    return new NextResponse("No autorizado", { status: 401 });
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const storedState = request.cookies.get("mp_oauth_state")?.value;
  const codeVerifier = request.cookies.get("mp_oauth_verifier")?.value;

  if (!code || !state || !storedState || state !== storedState || !codeVerifier) {
    return redirectToIntegrations(request, "error=estado");
  }

  try {
    const token = await exchangeOAuthCode({ code, codeVerifier });
    await saveMercadoPagoConnection({ token, adminUserId });

    return redirectToIntegrations(request, "connected=1");
  } catch (error) {
    console.error("[MERCADOPAGO_OAUTH_CALLBACK]", error);
    return redirectToIntegrations(request, "error=conexion");
  }
}
