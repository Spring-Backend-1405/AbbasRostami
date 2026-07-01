-- CreateEnum
CREATE TYPE "CommentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- DropIndex
DROP INDEX "Comment_courseId_createdAt_idx";

-- DropIndex
DROP INDEX "Comment_postId_createdAt_idx";

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "status" "CommentStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "Comment_courseId_status_createdAt_idx" ON "Comment"("courseId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_postId_status_createdAt_idx" ON "Comment"("postId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_status_idx" ON "Comment"("status");
