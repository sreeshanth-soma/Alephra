import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

// GET /api/share-links/[shareId] - Get a share link by shareId (public, no auth required)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ shareId: string }> | { shareId: string } }
) {
  try {
    const { shareId } = await Promise.resolve(params);

    if (!shareId) {
      return NextResponse.json(
        { error: "Share ID is required" },
        { status: 400 }
      );
    }

    const shareLink = await prisma.shareLink.findUnique({
      where: { shareId }
    });

    if (!shareLink) {
      return NextResponse.json(
        { error: "Share link not found" },
        { status: 404 }
      );
    }

    // Check if link has expired
    if (new Date() > shareLink.expiresAt) {
      return NextResponse.json(
        { error: "This shared link has expired" },
        { status: 410 }
      );
    }

    // Check if max views reached
    if (shareLink.maxViews && shareLink.viewCount >= shareLink.maxViews) {
      return NextResponse.json(
        { error: "This shared link has reached its maximum view limit" },
        { status: 410 }
      );
    }

    // Increment view count and log access
    const accessLog = JSON.parse(shareLink.accessLog || '[]');
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    accessLog.push({
      timestamp: new Date().toISOString(),
      ipAddress,
      userAgent
    });

    await prisma.shareLink.update({
      where: { shareId },
      data: {
        viewCount: shareLink.viewCount + 1,
        accessLog: JSON.stringify(accessLog)
      }
    });

    // Return share link data (without password hash)
    // If password protected, don't return reportData until password is verified
    return NextResponse.json({
      shareLink: {
        id: shareLink.shareId,
        shareId: shareLink.shareId,
        reportId: shareLink.reportId,
        fileName: shareLink.fileName,
        reportData: shareLink.password ? null : shareLink.reportData, // Don't return data if password protected
        summary: shareLink.password ? null : shareLink.summary, // Don't return summary if password protected
        uploadedAt: shareLink.uploadedAt,
        expiresAt: shareLink.expiresAt,
        viewCount: shareLink.viewCount + 1,
        maxViews: shareLink.maxViews,
        hasPassword: !!shareLink.password,
        createdAt: shareLink.createdAt
      }
    });
  } catch (error) {
    console.error("Error fetching share link:", error);
    return NextResponse.json(
      { error: "Failed to fetch share link" },
      { status: 500 }
    );
  }
}

// POST /api/share-links/[shareId]/verify - Verify password for a share link
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ shareId: string }> | { shareId: string } }
) {
  try {
    const { shareId } = await Promise.resolve(params);
    const body = await req.json();
    const { password } = body;

    if (!shareId) {
      return NextResponse.json(
        { error: "Share ID is required" },
        { status: 400 }
      );
    }

    const shareLink = await prisma.shareLink.findUnique({
      where: { shareId }
    });

    if (!shareLink) {
      return NextResponse.json(
        { error: "Share link not found" },
        { status: 404 }
      );
    }

    // Check if link has expired
    if (new Date() > shareLink.expiresAt) {
      return NextResponse.json(
        { error: "This shared link has expired" },
        { status: 410 }
      );
    }

    // Check if max views reached
    if (shareLink.maxViews && shareLink.viewCount >= shareLink.maxViews) {
      return NextResponse.json(
        { error: "This shared link has reached its maximum view limit" },
        { status: 410 }
      );
    }

    // Verify password if required
    if (shareLink.password) {
      if (!password) {
        return NextResponse.json(
          { error: "Password is required" },
          { status: 400 }
        );
      }

      // Verify password (format: salt:hash)
      const [salt, hash] = shareLink.password.split(':');
      const passwordHash = crypto.createHash('sha256').update(password + salt).digest('hex');
      if (passwordHash !== hash) {
        return NextResponse.json(
          { error: "Incorrect password" },
          { status: 401 }
        );
      }
    }

    // Return share link data
    return NextResponse.json({
      shareLink: {
        id: shareLink.shareId,
        shareId: shareLink.shareId,
        reportId: shareLink.reportId,
        fileName: shareLink.fileName,
        reportData: shareLink.reportData,
        summary: shareLink.summary,
        uploadedAt: shareLink.uploadedAt,
        expiresAt: shareLink.expiresAt,
        viewCount: shareLink.viewCount,
        maxViews: shareLink.maxViews,
        hasPassword: !!shareLink.password,
        createdAt: shareLink.createdAt
      }
    });
  } catch (error) {
    console.error("Error verifying share link password:", error);
    return NextResponse.json(
      { error: "Failed to verify password" },
      { status: 500 }
    );
  }
}

