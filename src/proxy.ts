import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const intl = createIntlMiddleware(routing);

/**
 * Combine deux middlewares :
 *   - `/admin/*` → auth NextAuth (sauf /admin/login)
 *   - tout le reste public → next-intl (locale routing)
 *
 * L'admin n'est PAS localisé (FR-only, c'est un cockpit privé).
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname.startsWith("/admin/login")) {
      return NextResponse.next();
    }
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const url = new URL("/admin/login", req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return intl(req);
}

export const config = {
  matcher: [
    "/((?!api|_next|_vercel|.*\\..*|opengraph-image|icon|apple-icon|manifest\\.webmanifest|sitemap\\.xml|robots\\.txt|blog/rss\\.xml).*)",
    "/admin/:path*",
  ],
};
