import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { google } from "googleapis";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reminders = await prisma.reminder.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        reminderTime: 'asc',
      },
    });

    return NextResponse.json({ reminders });
  } catch (error) {
    console.error("Reminders fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch reminders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, reminderTime } = await request.json();

    // Create reminder in database
    const reminder = await prisma.reminder.create({
      data: {
        title,
        description,
        reminderTime: new Date(reminderTime),
        userId: session.user.id,
      },
    });

    let googleEventId = null;

    // Try to create Google Calendar event
    try {
      // Get user's access token from database (if using database sessions)
      // For JWT sessions, we'll get it from the token
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );

      // For now, we'll skip Google Calendar creation and just create local reminders
      // This can be enhanced later with proper token management
      console.log("Reminder created locally:", reminder.id);

      /* TODO: Implement Google Calendar integration
      oauth2Client.setCredentials({
        access_token: userAccessToken,
        refresh_token: userRefreshToken,
      });

      const calendar = google.calendar({ version: "v3", auth: oauth2Client });

      const reminderDate = new Date(reminderTime);
      const endTime = new Date(reminderDate.getTime() + 15 * 60000); // 15 minutes duration

      const event = {
        summary: `💊 ${title}`,
        description: `Medical Reminder: ${description || title}`,
        start: {
          dateTime: reminderDate.toISOString(),
          timeZone: "America/New_York",
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: "America/New_York",
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: "popup", minutes: 0 }, // Immediate notification
            { method: "email", minutes: 10 }, // 10 minutes before
          ],
        },
        colorId: "11", // Red color for medical reminders
      };

      const response = await calendar.events.insert({
        calendarId: "primary",
        requestBody: event,
      });

      googleEventId = response.data.id;
      */

    } catch (calendarError) {
      console.error("Google Calendar error:", calendarError);
      // Continue without calendar integration for now
    }

    return NextResponse.json({ 
      reminder,
      googleEventId,
      message: "Reminder created successfully. Google Calendar integration coming soon!"
    });
  } catch (error) {
    console.error("Reminder creation error:", error);
    return NextResponse.json({ error: "Failed to create reminder" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, isCompleted } = await request.json();

    const reminder = await prisma.reminder.update({
      where: {
        id,
        userId: session.user.id, // Ensure user can only update their own reminders
      },
      data: {
        isCompleted,
      },
    });

    return NextResponse.json({ reminder });
  } catch (error) {
    console.error("Reminder update error:", error);
    return NextResponse.json({ error: "Failed to update reminder" }, { status: 500 });
  }
}
