import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n/config";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url));
  }

  const intlResponse = intlMiddleware(request);

  const { user, supabaseResponse } = await updateSession(request);
  const isProtectedRoute = pathname.includes("/dashboard");
  const isAuthRoute =
    pathname.includes("/login") || pathname.includes("/signup");

  if (isProtectedRoute && !user) {
    const locale = pathname.split("/")[1] || defaultLocale;
    const url = new URL(`/${locale}/login`, request.url);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && user) {
    const locale = pathname.split("/")[1] || defaultLocale;
    const url = new URL(`/${locale}/dashboard`, request.url);
    return NextResponse.redirect(url);
  }

  if (intlResponse) {
    intlResponse.headers.forEach((value, key) => {
      supabaseResponse.headers.set(key, value);
    });
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/",
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
