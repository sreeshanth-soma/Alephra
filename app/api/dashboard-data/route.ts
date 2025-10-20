import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Since this is server-side, we can't access localStorage directly
    // We'll return a message indicating the data is stored client-side
    return NextResponse.json({ 
      message: "Dashboard data is stored in browser localStorage. Please access it from the client-side.",
      dataAvailable: false 
    });
  } catch (error) {
    console.error("Dashboard data API error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
