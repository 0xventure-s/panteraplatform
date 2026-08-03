import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

const publicPathPatterns = [
  /^\/$/,
  /^\/search$/,
  /^\/cursos(?:\/[^/]+)?$/,
  /^\/pagos\/resultado$/,
  /^\/sign-in(?:\/.*)?$/,
  /^\/sign-up(?:\/.*)?$/,
  /^\/recuperar-acceso$/,
  /^\/restablecer-clave$/,
  /^\/api\/auth(?:\/.*)?$/,
  /^\/api\/webhooks\/mercadopago$/,
];

export default function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isPublicPath = publicPathPatterns.some((pattern) => pattern.test(pathname));

  if (isPublicPath || getSessionCookie(request)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const signInUrl = new URL("/sign-in", request.url);
  signInUrl.searchParams.set("callbackURL", `${pathname}${search}`);

  return NextResponse.redirect(signInUrl);
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
