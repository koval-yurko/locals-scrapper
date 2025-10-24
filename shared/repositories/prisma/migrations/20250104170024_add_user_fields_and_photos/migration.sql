-- AlterTable
ALTER TABLE "User" ADD COLUMN     "instagramUsername" TEXT,
ADD COLUMN     "linkedinLink" TEXT,
ADD COLUMN     "photos" JSONB,
ADD COLUMN     "shareLink" TEXT;
