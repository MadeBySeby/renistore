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

  const { user, supabaseResponse, userRole } = await updateSession(request);

  const locale = pathname.split("/")[1] || defaultLocale;

  const isAdminRoute = pathname.includes(`/${locale}/dashboard`);
  const isProfileRoute = pathname.includes(`/${locale}/profile`);
  const isAuthRoute =
    pathname.includes(`/${locale}/login`) ||
    pathname.includes(`/${locale}/signup`);

  const isAdmin = userRole === "admin" || false;

  if (isAuthRoute && user) {
    const redirectPath = isAdmin
      ? `/${locale}/dashboard`
      : `/${locale}/profile`;
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  if (isProfileRoute && !user) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  if (isAdminRoute && user && !isAdmin) {
    return NextResponse.redirect(new URL(`/${locale}/profile`, request.url));
  }

  const intlResponse = intlMiddleware(request);

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
