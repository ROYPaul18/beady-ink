/*
  Warnings:

  - You are about to drop the column `capacity` on the `OpeningHours` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `OpeningHours` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `OpeningHours` table. All the data in the column will be lost.
  - Added the required column `jour` to the `OpeningHours` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OpeningHours" DROP COLUMN "capacity",
DROP COLUMN "date",
DROP COLUMN "updatedAt",
ADD COLUMN     "jour" TEXT NOT NULL;
