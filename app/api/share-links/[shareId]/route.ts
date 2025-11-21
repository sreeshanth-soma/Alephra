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
    const searchParams = req.nextUrl.searchParams;
    const isPrefetch = searchParams.get("prefetch") === "true";

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

    if (new Date() > shareLink.expiresAt) {
      return NextResponse.json(
        { error: "This shared link has expired" },
        { status: 410 }
      );
    }

    if (shareLink.maxViews && shareLink.viewCount >= shareLink.maxViews) {
      return NextResponse.json(
        { error: "This shared link has reached its maximum view limit" },
        { status: 410 }
      );
    }

    if (isPrefetch) {
      return NextResponse.json({
        shareLink: {
          id: shareLink.shareId,
          shareId: shareLink.shareId,
          reportId: shareLink.reportId,
          fileName: shareLink.fileName,
          reportData: null,
          summary: null,
          uploadedAt: shareLink.uploadedAt,
          expiresAt: shareLink.expiresAt,
          viewCount: shareLink.viewCount,
          maxViews: shareLink.maxViews,
          hasPassword: !!shareLink.password,
          createdAt: shareLink.createdAt
        }
      });
    }

    const accessLog = JSON.parse(shareLink.accessLog || "[]");
    const userAgent = req.headers.get("user-agent") || "unknown";
    const ipAddress =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    accessLog.push({
      timestamp: new Date().toISOString(),
      ipAddress,
      userAgent
    });

    const updatedShareLink = await prisma.shareLink.update({
      where: { shareId },
      data: {
        viewCount: { increment: 1 },
        accessLog: JSON.stringify(accessLog)
      }
    });

    return NextResponse.json({
      shareLink: {
        id: updatedShareLink.shareId,
        shareId: updatedShareLink.shareId,
        reportId: updatedShareLink.reportId,
        fileName: updatedShareLink.fileName,
        reportData: updatedShareLink.password ? null : updatedShareLink.reportData,
        summary: updatedShareLink.password ? null : updatedShareLink.summary,
        uploadedAt: updatedShareLink.uploadedAt,
        expiresAt: updatedShareLink.expiresAt,
        viewCount: updatedShareLink.viewCount,
        maxViews: updatedShareLink.maxViews,
        hasPassword: !!updatedShareLink.password,
        createdAt: updatedShareLink.createdAt
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

    const accessLog = JSON.parse(shareLink.accessLog || "[]");
    const userAgent = req.headers.get("user-agent") || "unknown";
    const ipAddress =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    accessLog.push({
      timestamp: new Date().toISOString(),
      ipAddress,
      userAgent
    });

    const updatedShareLink = await prisma.shareLink.update({
      where: { shareId },
      data: {
        viewCount: { increment: 1 },
        accessLog: JSON.stringify(accessLog)
      }
    });

    return NextResponse.json({
      shareLink: {
        id: updatedShareLink.shareId,
        shareId: updatedShareLink.shareId,
        reportId: updatedShareLink.reportId,
        fileName: updatedShareLink.fileName,
        reportData: updatedShareLink.reportData,
        summary: updatedShareLink.summary,
        uploadedAt: updatedShareLink.uploadedAt,
        expiresAt: updatedShareLink.expiresAt,
        viewCount: updatedShareLink.viewCount,
        maxViews: updatedShareLink.maxViews,
        hasPassword: !!updatedShareLink.password,
        createdAt: updatedShareLink.createdAt
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

