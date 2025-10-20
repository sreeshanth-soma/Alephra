import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/reports - Fetch user's medical reports
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
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

    const reports = await prisma.medicalReport.findMany({
      where: { userId: user.id },
      orderBy: { uploadDate: 'desc' },
    });

    // Transform to match frontend format
    const formattedReports = reports.map((report: any) => ({
      id: report.id,
      fileName: report.fileName,
      fileUrl: report.fileUrl,
      fileType: report.fileType,
      fileSize: report.fileSize,
      reportText: report.reportText,
      summary: report.summary,
      extractedData: report.extractedData ? JSON.parse(report.extractedData) : null,
      uploadDate: report.uploadDate.toISOString(),
      reportDate: report.reportDate?.toISOString(),
      category: report.category,
      status: report.status,
    }));

    return NextResponse.json({ reports: formattedReports });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

// POST /api/reports - Create new medical report
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
      fileName, 
      fileUrl, 
      fileType, 
      fileSize, 
      reportText, 
      summary, 
      extractedData,
      reportDate,
      category 
    } = body;

    if (!fileName || !reportText) {
      return NextResponse.json(
        { error: "Missing required fields: fileName, reportText" },
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

    // Create report
    const report = await prisma.medicalReport.create({
      data: {
        userId: user.id,
        fileName,
        fileUrl: fileUrl || null,
        fileType: fileType || null,
        fileSize: fileSize || null,
        reportText,
        summary: summary || null,
        extractedData: extractedData ? JSON.stringify(extractedData) : null,
        reportDate: reportDate ? new Date(reportDate) : null,
        category: category || 'General',
        status: 'processed',
      },
    });

    // Return in frontend format
    const formattedReport = {
      id: report.id,
      fileName: report.fileName,
      fileUrl: report.fileUrl,
      fileType: report.fileType,
      fileSize: report.fileSize,
      reportText: report.reportText,
      summary: report.summary,
      extractedData: report.extractedData ? JSON.parse(report.extractedData) : null,
      uploadDate: report.uploadDate.toISOString(),
      reportDate: report.reportDate?.toISOString(),
      category: report.category,
      status: report.status,
    };

    return NextResponse.json({ report: formattedReport });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    );
  }
}

// DELETE /api/reports?id=xxx - Delete report by ID
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

    // Delete report (ensure it belongs to user)
await prisma.medicalReport.delete({
  where: {
     id,
     userId: user.id,
  },
});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting report:", error);
    return NextResponse.json(
      { error: "Failed to delete report" },
      { status: 500 }
    );
  }
}
