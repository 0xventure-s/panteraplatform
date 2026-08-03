CREATE INDEX "ProfileLink_userId_position_idx"
ON "ProfileLink"("userId", "position");

CREATE INDEX "Course_isPublished_createdAt_idx"
ON "Course"("isPublished", "createdAt");

CREATE INDEX "Course_isPublished_updatedAt_idx"
ON "Course"("isPublished", "updatedAt");

CREATE INDEX "Course_isPublished_categoryId_createdAt_idx"
ON "Course"("isPublished", "categoryId", "createdAt");

CREATE INDEX "Chapter_courseId_isPublished_position_idx"
ON "Chapter"("courseId", "isPublished", "position");

CREATE INDEX "CourseReview_courseId_updatedAt_idx"
ON "CourseReview"("courseId", "updatedAt");

CREATE INDEX "UserProgress_userId_isCompleted_idx"
ON "UserProgress"("userId", "isCompleted");

CREATE INDEX "Purchase_userId_createdAt_idx"
ON "Purchase"("userId", "createdAt");

CREATE INDEX "Payment_status_courseId_idx"
ON "Payment"("status", "courseId");
