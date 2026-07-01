-- AlterTable
ALTER TABLE "User" ADD COLUMN     "resetPasswordCode" TEXT,
ADD COLUMN     "resetPasswordExpires" TIMESTAMP(3);
