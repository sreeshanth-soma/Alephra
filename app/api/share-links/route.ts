import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import crypto from "crypto";

// POST /api/share-links - Create a new share link
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
    const { reportId, fileName, reportData, summary, uploadedAt, expiryHours, maxViews, password } = body;

    if (!reportId || !fileName || !reportData) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Generate share ID
    const shareId = `share-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate expiry date
    const expiresAt = new Date(Date.now() + (expiryHours || 24) * 60 * 60 * 1000);

    // Hash password if provided (using SHA-256 with salt)
    let hashedPassword: string | null = null;
    if (password && password.trim() !== '') {
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.createHash('sha256').update(password + salt).digest('hex');
      hashedPassword = `${salt}:${hash}`;
    }

    // Create share link
    const shareLink = await prisma.shareLink.create({
      data: {
        shareId,
        reportId,
        userId: user.id,
        fileName,
        reportData,
        summary: summary || null,
        uploadedAt: new Date(uploadedAt),
        expiresAt,
        viewCount: 0,
        maxViews: maxViews || null,
        password: hashedPassword,
        accessLog: JSON.stringify([])
      }
    });

    return NextResponse.json({ 
      shareLink: {
        id: shareLink.shareId,
        shareId: shareLink.shareId,
        reportId: shareLink.reportId,
        url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/shared/${shareLink.shareId}`,
        expiresAt: shareLink.expiresAt,
        viewCount: shareLink.viewCount,
        maxViews: shareLink.maxViews,
        hasPassword: !!shareLink.password,
        createdAt: shareLink.createdAt
      }
    });
  } catch (error) {
    console.error("Error creating share link:", error);
    return NextResponse.json(
      { error: "Failed to create share link" },
      { status: 500 }
    );
  }
}

// GET /api/share-links - Get all share links for the current user
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
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get query params
    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get('reportId');

    const where: any = { userId: user.id };
    if (reportId) {
      where.reportId = reportId;
    }

    const shareLinks = await prisma.shareLink.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        shareId: true,
        reportId: true,
        fileName: true,
        expiresAt: true,
        viewCount: true,
        maxViews: true,
        password: true,
        createdAt: true,
        accessLog: true
      }
    });

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    const formattedLinks = shareLinks.map(link => ({
      id: link.shareId,
      shareId: link.shareId,
      reportId: link.reportId,
      fileName: link.fileName,
      url: `${baseUrl}/shared/${link.shareId}`,
      expiresAt: link.expiresAt,
      viewCount: link.viewCount,
      maxViews: link.maxViews,
      hasPassword: !!link.password,
      createdAt: link.createdAt,
      accessLog: JSON.parse(link.accessLog || '[]')
    }));

    return NextResponse.json({ shareLinks: formattedLinks });
  } catch (error) {
    console.error("Error fetching share links:", error);
    return NextResponse.json(
      { error: "Failed to fetch share links" },
      { status: 500 }
    );
  }
}

// DELETE /api/share-links - Delete a share link
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
    const shareId = searchParams.get('shareId');

    if (!shareId) {
      return NextResponse.json(
        { error: "Share ID is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verify the share link belongs to the user
    const shareLink = await prisma.shareLink.findUnique({
      where: { shareId }
    });

    if (!shareLink) {
      return NextResponse.json(
        { error: "Share link not found" },
        { status: 404 }
      );
    }

    if (shareLink.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    await prisma.shareLink.delete({
      where: { shareId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting share link:", error);
    return NextResponse.json(
      { error: "Failed to delete share link" },
      { status: 500 }
    );
  }
}

