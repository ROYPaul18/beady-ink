/*
  Warnings:

  - Added the required column `date` to the `OpeningHours` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OpeningHours" ADD COLUMN     "date" TIMESTAMP(3) NOT NULL;
