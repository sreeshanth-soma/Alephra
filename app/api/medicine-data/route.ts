import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/medicine-data - Fetch user's medicine data
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const medicineData = await prisma.medicineData.findUnique({
      where: { userEmail: session.user.email }
    });

    if (!medicineData) {
      return NextResponse.json({
        medicineData: {
          stock: {},
          frequency: {},
          favorites: []
        }
      });
    }

    return NextResponse.json({
      medicineData: {
        stock: JSON.parse(medicineData.stock),
        frequency: JSON.parse(medicineData.frequency),
        favorites: JSON.parse(medicineData.favorites)
      }
    });
  } catch (error) {
    console.error("Error fetching medicine data:", error);
    return NextResponse.json(
      { error: "Failed to fetch medicine data" },
      { status: 500 }
    );
  }
}

// POST /api/medicine-data - Update medicine data
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
    const { stock, frequency, favorites } = body;

    // Upsert medicine data
    const medicineData = await prisma.medicineData.upsert({
      where: { userEmail: session.user.email },
      update: {
        stock: JSON.stringify(stock || {}),
        frequency: JSON.stringify(frequency || {}),
        favorites: JSON.stringify(favorites || [])
      },
      create: {
        userEmail: session.user.email,
        stock: JSON.stringify(stock || {}),
        frequency: JSON.stringify(frequency || {}),
        favorites: JSON.stringify(favorites || [])
      }
    });

    return NextResponse.json({
      medicineData: {
        stock: JSON.parse(medicineData.stock),
        frequency: JSON.parse(medicineData.frequency),
        favorites: JSON.parse(medicineData.favorites)
      }
    });
  } catch (error) {
    console.error("Error saving medicine data:", error);
    return NextResponse.json(
      { error: "Failed to save medicine data" },
      { status: 500 }
    );
  }
}

