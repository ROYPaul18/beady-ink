/*
  Warnings:

  - Added the required column `weekKey` to the `OpeningHours` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OpeningHours" ADD COLUMN     "weekKey" TEXT NOT NULL;
