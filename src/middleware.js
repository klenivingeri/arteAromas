import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionCookieEdge } from "./lib/auth.shared";

function redirectToLogin(request) {
  const url = request.nextUrl.clone();
  url.pathname = "/decorador";
  url.searchParams.set("from", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export async function middleware(request) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const secret = process.env.COOKIE_SECRET;

  if (!sessionCookie || !secret) {
    return redirectToLogin(request);
  }

  const isValid = await verifySessionCookieEdge(sessionCookie, secret);

  if (!isValid) {
    const response = redirectToLogin(request);
    response.cookies.set(SESSION_COOKIE_NAME, "", {
      path: "/",
      maxAge: 0,
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/painel/:path*"],
};
