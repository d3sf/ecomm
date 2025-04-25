import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  
  // Skip middleware for public routes
  if (
    pathname === "/login" || 
    pathname === "/admin/login" || 
    pathname === "/admin/signup" || 
    pathname.startsWith("/api/")
  ) {
    return NextResponse.next();
  }
  
  // Handle auth callbacks
  if (pathname.startsWith("/api/auth/callback/google")) {
    const searchParams = req.nextUrl.searchParams;
    const callbackUrl = searchParams.get("callbackUrl");
    
    // Create a response that preserves the state cookie
    const response = NextResponse.next();
    
    // Determine which auth endpoint to redirect to based on the callback URL
    if (callbackUrl?.includes("/admin")) {
      const redirectUrl = new URL("/api/admin-auth/callback/google", req.url);
      redirectUrl.search = searchParams.toString();
      return NextResponse.redirect(redirectUrl);
    } else {
      const redirectUrl = new URL("/api/shop-auth/callback/google", req.url);
      redirectUrl.search = searchParams.toString();
      return NextResponse.redirect(redirectUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/auth/callback/google",
  ],
};

