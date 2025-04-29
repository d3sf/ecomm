import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  
  // Process Google OAuth callback for shop authentication
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  
  if (code && state) {
    // This is handled by NextAuth normally, but left here in case you need custom handling
    console.log("Processing Google auth callback for shop user");
  }
  
  // Redirect to the main page or shop dashboard
  return NextResponse.redirect(new URL("/", request.url));
} 