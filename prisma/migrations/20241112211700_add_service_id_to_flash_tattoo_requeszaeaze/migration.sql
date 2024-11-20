/*
  Warnings:

  - You are about to drop the column `placement` on the `FlashTattooRequest` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `FlashTattooRequest` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `FlashTattooRequest` table. All the data in the column will be lost.
  - Made the column `healthData` on table `FlashTattooRequest` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "FlashTattooRequest" DROP COLUMN "placement",
DROP COLUMN "size",
DROP COLUMN "status",
ALTER COLUMN "healthData" SET NOT NULL;
