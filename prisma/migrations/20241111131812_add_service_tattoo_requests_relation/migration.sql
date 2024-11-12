/*
  Warnings:

  - Added the required column `serviceId` to the `TattooRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TattooRequest" ADD COLUMN     "serviceId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "TattooRequest" ADD CONSTRAINT "TattooRequest_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
