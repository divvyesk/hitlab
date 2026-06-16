import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE } from "@/lib/auth/constants";

const AUTH_PATHS = ["/login", "/signup"];

async function isAuthenticated(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;

  const secret = process.env.AUTH_SECRET;
  if (!secret) return false;

  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const loggedIn = await isAuthenticated(request);

  if (pathname.startsWith("/app") && !loggedIn) {
    const signupUrl = new URL("/signup", request.url);
    signupUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(signupUrl);
  }

  if (loggedIn && AUTH_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  if (pathname === "/" && loggedIn) {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/app", "/app/:path*", "/login", "/signup"],
};
