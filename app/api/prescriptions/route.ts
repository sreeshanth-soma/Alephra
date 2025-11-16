import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/prescriptions - Fetch user's prescriptions
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const prescriptions = await prisma.prescription.findMany({
      where: { userEmail: session.user.email },
      orderBy: { prescriptionDate: 'desc' }
    });

    // Parse JSON fields
    const formattedPrescriptions = prescriptions.map((prescription: any) => ({
      id: prescription.id,
      doctorName: prescription.doctorName,
      reason: prescription.reason,
      prescriptionDate: prescription.prescriptionDate.toISOString().split('T')[0],
      medicines: JSON.parse(prescription.medicines),
      reportId: prescription.reportId,
      reportName: prescription.reportName,
      comments: prescription.comments,
      takenLog: JSON.parse(prescription.takenLog)
    }));

    return NextResponse.json({ prescriptions: formattedPrescriptions });
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch prescriptions" },
      { status: 500 }
    );
  }
}

// POST /api/prescriptions - Create/Update prescription
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
    const { 
      id,
      doctorName,
      reason,
      prescriptionDate,
      medicines,
      reportId,
      reportName,
      comments,
      takenLog
    } = body;

    if (!doctorName || !reason || !prescriptionDate || !medicines) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Use upsert to handle both create and update
    // This handles the case where a prescription was created locally with an ID
    // but doesn't exist in the database yet
    const prescription = await prisma.prescription.upsert({
      where: { 
        id: id || 'new-prescription-temp-id' // Use temp ID if no ID provided
      },
      update: {
        doctorName,
        reason,
        prescriptionDate: new Date(prescriptionDate),
        medicines: JSON.stringify(medicines),
        reportId: reportId || null,
        reportName: reportName || null,
        comments: comments || null,
        takenLog: JSON.stringify(takenLog || [])
      },
      create: {
        id: id, // Use provided ID if available (for client-generated IDs)
        doctorName,
        reason,
        prescriptionDate: new Date(prescriptionDate),
        medicines: JSON.stringify(medicines),
        reportId: reportId || null,
        reportName: reportName || null,
        comments: comments || null,
        takenLog: JSON.stringify(takenLog || []),
        userEmail: session.user.email
      }
    });

    return NextResponse.json({
      prescription: {
        id: prescription.id,
        doctorName: prescription.doctorName,
        reason: prescription.reason,
        prescriptionDate: prescription.prescriptionDate.toISOString().split('T')[0],
        medicines: JSON.parse(prescription.medicines),
        reportId: prescription.reportId,
        reportName: prescription.reportName,
        comments: prescription.comments,
        takenLog: JSON.parse(prescription.takenLog)
      }
    });
  } catch (error: any) {
    console.error("Error saving prescription:", error);
    console.error("Error details:", error.message, error.stack);
    return NextResponse.json(
      { error: "Failed to save prescription", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/prescriptions - Delete prescription
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
        { error: "Prescription ID required" },
        { status: 400 }
      );
    }

    // First verify the prescription belongs to the user
    const prescription = await prisma.prescription.findUnique({
      where: { id }
    });
    
    if (!prescription || prescription.userEmail !== session.user.email) {
      return NextResponse.json(
        { error: "Prescription not found or unauthorized" },
        { status: 404 }
      );
    }
    
    await prisma.prescription.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting prescription:", error);
    return NextResponse.json(
      { error: "Failed to delete prescription" },
      { status: 500 }
    );
  }
}

