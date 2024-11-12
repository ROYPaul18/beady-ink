/*
  Warnings:

  - Added the required column `date` to the `OpeningHours` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `OpeningHours` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time` to the `Reservation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OpeningHours" ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "time" TEXT NOT NULL;
