-- CreateTable
CREATE TABLE "public"."ShareLink" (
    "id" TEXT NOT NULL,
    "shareId" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "reportData" TEXT NOT NULL,
    "summary" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "maxViews" INTEGER,
    "password" TEXT,
    "accessLog" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShareLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShareLink_shareId_key" ON "public"."ShareLink"("shareId");

-- CreateIndex
CREATE INDEX "ShareLink_shareId_idx" ON "public"."ShareLink"("shareId");

-- CreateIndex
CREATE INDEX "ShareLink_userId_idx" ON "public"."ShareLink"("userId");

-- CreateIndex
CREATE INDEX "ShareLink_expiresAt_idx" ON "public"."ShareLink"("expiresAt");

-- AddForeignKey
ALTER TABLE "public"."ShareLink" ADD CONSTRAINT "ShareLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
