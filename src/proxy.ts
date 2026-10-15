import { NextResponse } from "next/server";
import { auth, authEnabled } from "@/auth";

export const proxy = auth((req) => {
  if (!authEnabled) return NextResponse.next();

  const { pathname } = req.nextUrl;

  // Machine access (iOS Shortcut etc.) to the import endpoint only
  if (pathname.startsWith("/api/get-url") && process.env.API_TOKEN) {
    if (req.headers.get("authorization") === `Bearer ${process.env.API_TOKEN}`) {
      return NextResponse.next();
    }
  }

  if (req.auth) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const signInUrl = new URL("/signin", req.nextUrl.origin);
  signInUrl.searchParams.set("callbackUrl", req.nextUrl.href);
  return NextResponse.redirect(signInUrl);
});

export const config = {
  matcher: [
    "/((?!api/auth|signin|_next/static|_next/image|favicon.ico|manifest.webmanifest|.*\\.(?:png|jpg|jpeg|svg|ico|webp|json)$).*)",
  ],
};
