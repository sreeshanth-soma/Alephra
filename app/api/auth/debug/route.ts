import { NextResponse } from "next/server";

export async function GET() {
  // Don't expose actual values, just check if they exist
  return NextResponse.json({
    env_check: {
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || "NOT SET",
      GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
      NODE_ENV: process.env.NODE_ENV,
      // Show first few characters to verify it's the right one
      CLIENT_ID_PREFIX: process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + "...",
    }
  });
}

