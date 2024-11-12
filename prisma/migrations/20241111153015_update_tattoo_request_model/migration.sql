/*
  Warnings:

  - Made the column `userId` on table `TattooRequest` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "TattooRequest" DROP CONSTRAINT "TattooRequest_userId_fkey";

-- AlterTable
ALTER TABLE "TattooRequest" ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "TattooRequest" ADD CONSTRAINT "TattooRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
