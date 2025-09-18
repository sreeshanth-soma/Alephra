import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Authentication removed - all routes are now public
  return NextResponse.next();
}

export const config = {
  matcher: [],
};


