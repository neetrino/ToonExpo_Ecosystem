-- CreateEnum
CREATE TYPE "ReadinessTargetType" AS ENUM ('BUILDER_COMPANY', 'PROJECT');

-- CreateEnum
CREATE TYPE "ReadinessStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'NEEDS_IMPROVEMENT', 'READY', 'BLOCKED');

-- CreateTable
CREATE TABLE "ReadinessCategory" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "weight" DOUBLE PRECISION,
    "sortOrder" INTEGER NOT NULL,
    "serviceCategoryKey" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReadinessCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadinessAssessment" (
    "id" TEXT NOT NULL,
    "targetType" "ReadinessTargetType" NOT NULL,
    "companyId" TEXT NOT NULL,
    "projectId" TEXT,
    "status" "ReadinessStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "overallScore" INTEGER,
    "evaluatedByUserId" TEXT,
    "lastEvaluatedAt" TIMESTAMP(3),
    "responsibleContact" TEXT,
    "recommendation" TEXT,
    "requiredActions" TEXT,
    "internalNotes" TEXT,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReadinessAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadinessCategoryScore" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "score" INTEGER,
    "status" "ReadinessStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "recommendation" TEXT,
    "requiredActions" TEXT,
    "internalNote" TEXT,
    "evaluatedByUserId" TEXT,
    "evaluatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReadinessCategoryScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReadinessCategory_key_key" ON "ReadinessCategory"("key");

-- CreateIndex
CREATE INDEX "ReadinessCategory_active_sortOrder_idx" ON "ReadinessCategory"("active", "sortOrder");

-- CreateIndex
CREATE INDEX "ReadinessAssessment_companyId_idx" ON "ReadinessAssessment"("companyId");

-- CreateIndex
CREATE INDEX "ReadinessAssessment_projectId_idx" ON "ReadinessAssessment"("projectId");

-- CreateIndex
CREATE INDEX "ReadinessAssessment_targetType_idx" ON "ReadinessAssessment"("targetType");

-- CreateIndex
CREATE INDEX "ReadinessAssessment_status_idx" ON "ReadinessAssessment"("status");

-- CreateIndex
CREATE INDEX "ReadinessAssessment_archivedAt_idx" ON "ReadinessAssessment"("archivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ReadinessCategoryScore_assessmentId_categoryId_key" ON "ReadinessCategoryScore"("assessmentId", "categoryId");

-- CreateIndex
CREATE INDEX "ReadinessCategoryScore_categoryId_idx" ON "ReadinessCategoryScore"("categoryId");

-- AddForeignKey
ALTER TABLE "ReadinessAssessment" ADD CONSTRAINT "ReadinessAssessment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadinessAssessment" ADD CONSTRAINT "ReadinessAssessment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadinessAssessment" ADD CONSTRAINT "ReadinessAssessment_evaluatedByUserId_fkey" FOREIGN KEY ("evaluatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadinessCategoryScore" ADD CONSTRAINT "ReadinessCategoryScore_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "ReadinessAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadinessCategoryScore" ADD CONSTRAINT "ReadinessCategoryScore_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ReadinessCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadinessCategoryScore" ADD CONSTRAINT "ReadinessCategoryScore_evaluatedByUserId_fkey" FOREIGN KEY ("evaluatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
