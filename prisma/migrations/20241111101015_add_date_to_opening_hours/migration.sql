/*
  Warnings:

  - A unique constraint covering the columns `[date]` on the table `OpeningHours` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "OpeningHours_date_key" ON "OpeningHours"("date");