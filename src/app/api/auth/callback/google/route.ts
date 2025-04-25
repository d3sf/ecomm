import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  
  // Extract all query parameters
  const params = new URLSearchParams();
  for (const [key, value] of searchParams.entries()) {
    params.append(key, value);
  }
  
  // Construct the redirect URL to shop-auth
  const redirectUrl = `/api/shop-auth/callback/google?${params.toString()}`;
  
  console.log(`Redirecting from /api/auth/callback/google to ${redirectUrl}`);
  
  // Redirect to the proper route
  return NextResponse.redirect(new URL(redirectUrl, request.url));
} 