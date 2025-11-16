-- CreateTable
CREATE TABLE "public"."Prescription" (
    "id" TEXT NOT NULL,
    "doctorName" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "prescriptionDate" TIMESTAMP(3) NOT NULL,
    "medicines" TEXT NOT NULL,
    "reportId" TEXT,
    "reportName" TEXT,
    "comments" TEXT,
    "takenLog" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MedicineData" (
    "id" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "stock" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "favorites" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicineData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Prescription_userEmail_idx" ON "public"."Prescription"("userEmail");

-- CreateIndex
CREATE UNIQUE INDEX "MedicineData_userEmail_key" ON "public"."MedicineData"("userEmail");

-- CreateIndex
CREATE INDEX "MedicineData_userEmail_idx" ON "public"."MedicineData"("userEmail");
