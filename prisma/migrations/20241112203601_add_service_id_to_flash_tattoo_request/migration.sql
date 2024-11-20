/*
  Warnings:

  - Added the required column `serviceId` to the `FlashTattooRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FlashTattooRequest" ADD COLUMN     "serviceId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "FlashTattooRequest" ADD CONSTRAINT "FlashTattooRequest_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
