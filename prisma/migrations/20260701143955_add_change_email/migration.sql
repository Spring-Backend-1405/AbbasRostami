-- AlterTable
ALTER TABLE "User" ADD COLUMN     "changeEmailCode" TEXT,
ADD COLUMN     "changeEmailExpires" TIMESTAMP(3),
ADD COLUMN     "pendingNewEmail" TEXT;
