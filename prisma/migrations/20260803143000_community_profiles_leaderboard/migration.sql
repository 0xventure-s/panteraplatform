ALTER TABLE "User"
ADD COLUMN "headline" TEXT,
ADD COLUMN "bio" TEXT,
ADD COLUMN "location" TEXT;

CREATE TABLE "ProfileLink" (
  "id" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProfileLink_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProfileLink_userId_url_key" ON "ProfileLink"("userId", "url");
CREATE INDEX "ProfileLink_userId_idx" ON "ProfileLink"("userId");

ALTER TABLE "ProfileLink"
ADD CONSTRAINT "ProfileLink_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
