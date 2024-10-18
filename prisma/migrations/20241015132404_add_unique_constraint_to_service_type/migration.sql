/*
  Warnings:

  - A unique constraint covering the columns `[type]` on the table `Service` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Service_type_key" ON "Service"("type");
