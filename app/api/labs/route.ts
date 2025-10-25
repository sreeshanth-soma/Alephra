import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/labs - Fetch user's lab results
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Optimized: Single query with relation, limited to last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const labs = await prisma.lab.findMany({
      where: { 
        user: { email: session.user.email },
        date: { gte: sixMonthsAgo } // Only last 6 months
      },
      orderBy: { date: 'desc' },
      take: 50, // Max 50 records
    });

    // Transform to match frontend format
    const formattedLabs = labs.map((lab: any) => ({
      id: lab.id,
      name: lab.name,
      value: lab.value,
      unit: lab.unit,
      date: lab.date.toISOString().split('T')[0],
      normalRange: {
        min: lab.normalRangeMin || 0,
        max: lab.normalRangeMax || 0,
      },
      category: lab.category || "General",
    }));

    return NextResponse.json({ labs: formattedLabs });
  } catch (error) {
    console.error("Error fetching labs:", error);
    return NextResponse.json(
      { error: "Failed to fetch labs" },
      { status: 500 }
    );
  }
}

// POST /api/labs - Create new lab result
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
    const { name, value, unit, date, normalRange, category } = body;

    if (!name || value === undefined || !unit || !date) {
      return NextResponse.json(
        { error: "Missing required fields: name, value, unit, date" },
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

    // Create lab
    const lab = await prisma.lab.create({
      data: {
        userId: user.id,
        name,
        value: parseFloat(value),
        unit,
        date: new Date(date),
        normalRangeMin: normalRange?.min || null,
        normalRangeMax: normalRange?.max || null,
        category: category || "General",
      },
    });

    // Return in frontend format
    const formattedLab = {
      id: lab.id,
      name: lab.name,
      value: lab.value,
      unit: lab.unit,
      date: lab.date.toISOString().split('T')[0],
      normalRange: {
        min: lab.normalRangeMin || 0,
        max: lab.normalRangeMax || 0,
      },
      category: lab.category || "General",
    };

    return NextResponse.json({ lab: formattedLab });
  } catch (error) {
    console.error("Error creating lab:", error);
    return NextResponse.json(
      { error: "Failed to create lab" },
      { status: 500 }
    );
  }
}

// DELETE /api/labs?id=xxx - Delete lab by ID
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
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: "Missing id parameter" },
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

    // Delete lab (ensure it belongs to user)
    await prisma.lab.deleteMany({
      where: {
        id,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting lab:", error);
    return NextResponse.json(
      { error: "Failed to delete lab" },
      { status: 500 }
    );
  }
}
