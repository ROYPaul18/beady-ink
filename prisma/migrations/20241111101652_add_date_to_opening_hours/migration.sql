/*
  Warnings:

  - You are about to drop the column `date` on the `OpeningHours` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "OpeningHours_date_key";

-- AlterTable
ALTER TABLE "OpeningHours" DROP COLUMN "date";
