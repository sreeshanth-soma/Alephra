import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { google } from "googleapis";
import { getToken } from "next-auth/jwt";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the JWT token to access the stored access token
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token?.accessToken) {
      return NextResponse.json({ 
        error: "No Google access token found. Please sign in again." 
      }, { status: 400 });
    }

    const { title, description, reminderTime, timeZone } = await request.json();

    // Set up Google Calendar API
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: token.accessToken as string,
      refresh_token: token.refreshToken as string,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const reminderDate = new Date(reminderTime);
    const endTime = new Date(reminderDate.getTime() + 15 * 60000); // 15 minutes duration

    // Use the timezone sent from the client, or fallback to a default
    const userTimeZone = timeZone || "America/New_York";
    
    console.log("Reminder creation debug:", {
      reminderTime,
      userTimeZone,
      reminderDate: reminderDate.toISOString(),
      localTime: reminderDate.toLocaleString(),
    });
    
    const event = {
      summary: `💊 ${title}`,
      description: `Medical Reminder: ${description || title}\n\nCreated by MedScan AI Healthcare Assistant`,
      start: {
        dateTime: reminderDate.toISOString(),
        timeZone: userTimeZone,
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: userTimeZone,
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "popup", minutes: 0 },
          { method: "email", minutes: 15 },
        ],
      },
      colorId: "11",
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
    });

    return NextResponse.json({ 
      success: true,
      googleEventId: response.data.id,
      eventLink: response.data.htmlLink,
      message: "Reminder added to Google Calendar successfully!"
    });

  } catch (error) {
    console.error("Google Calendar sync error:", error);

    // ✅ Type-safe narrowing
    if (typeof error === "object" && error !== null && "code" in error) {
      const err = error as { code?: number };
      if (err.code === 401) {
        return NextResponse.json({ 
          error: "Google authentication expired. Please sign in again." 
        }, { status: 401 });
      }
    }
    
    return NextResponse.json({ 
      error: "Failed to sync reminder with Google Calendar" 
    }, { status: 500 });
  }
}
