import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/reports/[id] - Fetch full details of a specific report
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;

    // Fetch full report including heavy TEXT fields
    const report = await prisma.medicalReport.findFirst({
      where: {
        id,
        user: { email: session.user.email } // Ensure user owns this report
      }
    });

    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    // Transform to match frontend format
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
    console.error("Error fetching report:", error);
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 }
    );
  }
}
