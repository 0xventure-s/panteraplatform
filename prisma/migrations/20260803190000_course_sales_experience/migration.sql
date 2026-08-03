-- AlterTable
ALTER TABLE "Course"
ADD COLUMN "subtitle" TEXT,
ADD COLUMN "level" TEXT,
ADD COLUMN "estimatedMinutes" INTEGER,
ADD COLUMN "outcomes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "targetAudience" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "notForAudience" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "prerequisites" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "projectTitle" TEXT,
ADD COLUMN "projectDescription" TEXT,
ADD COLUMN "projectImageUrl" TEXT;

-- AlterTable
ALTER TABLE "Chapter"
ADD COLUMN "moduleTitle" TEXT,
ADD COLUMN "durationMinutes" INTEGER,
ADD COLUMN "isTrailer" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "CourseFaq" (
  "id" TEXT NOT NULL,
  "question" TEXT NOT NULL,
  "answer" TEXT NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0,
  "courseId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CourseFaq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseReview" (
  "id" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "comment" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CourseReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CourseFaq_courseId_idx" ON "CourseFaq"("courseId");

-- CreateIndex
CREATE INDEX "CourseReview_courseId_idx" ON "CourseReview"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseReview_userId_courseId_key" ON "CourseReview"("userId", "courseId");

-- AddForeignKey
ALTER TABLE "CourseFaq" ADD CONSTRAINT "CourseFaq_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseReview" ADD CONSTRAINT "CourseReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseReview" ADD CONSTRAINT "CourseReview_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
