import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  
  // Catch all Google auth callbacks and route correctly
  if (pathname.includes("/callback/google")) {
    // Always redirect to admin-auth for Google callbacks
    const redirectUrl = new URL("/api/admin-auth/callback/google", req.url);
    redirectUrl.search = req.nextUrl.search;
    return NextResponse.redirect(redirectUrl);
  }
  
  // Allow all other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/auth/callback/google",
    "/api/shop-auth/callback/google"
  ],
};

