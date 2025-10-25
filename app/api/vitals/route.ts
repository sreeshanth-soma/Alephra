import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/vitals - Fetch user's vitals
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Optimized: Single query with relation, limited to last 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const vitals = await prisma.vital.findMany({
      where: { 
        user: { email: session.user.email },
        date: { gte: ninetyDaysAgo } // Only last 90 days
      },
      orderBy: { date: 'desc' },
      take: 100, // Max 100 records
    });

    // Transform to match frontend format
    const formattedVitals = vitals.map(v => ({
      time: v.date.toISOString().split('T')[0],
      date: v.date.toISOString().split('T')[0],
      hr: v.heartRate,
      spo2: v.spo2,
      ...(v.bpSystolic && v.bpDiastolic && {
        bp: { systolic: v.bpSystolic, diastolic: v.bpDiastolic }
      }),
      ...(v.weight && { weight: v.weight }),
      ...(v.temperature && { temperature: v.temperature }),
    }));

    return NextResponse.json({ vitals: formattedVitals });
  } catch (error) {
    console.error("Error fetching vitals:", error);
    return NextResponse.json(
      { error: "Failed to fetch vitals" },
      { status: 500 }
    );
  }
}

// POST /api/vitals - Create new vital
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { date, hr, spo2, bp, weight, temperature } = body;

    if (!date || !hr || !spo2) {
      return NextResponse.json(
        { error: "Missing required fields: date, hr, spo2" },
        { status: 400 }
      );
    }

    // Upsert user
    const user = await prisma.user.upsert({
      where: { email: session.user.email },
      update: {},
      create: {
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
      },
    });

    // Create vital
    const vital = await prisma.vital.create({
      data: {
        userId: user.id,
        date: new Date(date),
        heartRate: hr,
        spo2: spo2,
        ...(bp?.systolic && bp?.diastolic && {
          bpSystolic: bp.systolic,
          bpDiastolic: bp.diastolic,
        }),
        ...(weight && { weight: parseFloat(weight) }),
        ...(temperature && { temperature: parseFloat(temperature) }),
      },
    });

    // Return in frontend format
    const formattedVital = {
      time: vital.date.toISOString().split('T')[0],
      date: vital.date.toISOString().split('T')[0],
      hr: vital.heartRate,
      spo2: vital.spo2,
      ...(vital.bpSystolic && vital.bpDiastolic && {
        bp: { systolic: vital.bpSystolic, diastolic: vital.bpDiastolic }
      }),
      ...(vital.weight && { weight: vital.weight }),
      ...(vital.temperature && { temperature: vital.temperature }),
    };

    return NextResponse.json({ vital: formattedVital });
  } catch (error) {
    console.error("Error creating vital:", error);
    return NextResponse.json(
      { error: "Failed to create vital" },
      { status: 500 }
    );
  }
}

// DELETE /api/vitals?date=YYYY-MM-DD - Delete vital by date
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: "Missing date parameter" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Delete vital
    await prisma.vital.deleteMany({
      where: {
        userId: user.id,
        date: new Date(date),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting vital:", error);
    return NextResponse.json(
      { error: "Failed to delete vital" },
      { status: 500 }
    );
  }
}
