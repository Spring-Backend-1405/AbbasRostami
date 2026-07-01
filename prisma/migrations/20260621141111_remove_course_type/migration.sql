/*
  Warnings:

  - You are about to drop the column `type` on the `Course` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Course_categoryId_level_type_idx";

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "type";

-- DropEnum
DROP TYPE "CourseType";
