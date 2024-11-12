-- CreateEnum
CREATE TYPE "OnglerieCategory" AS ENUM ('SEMI_PERMANENT', 'POSE_GEL', 'SOIN');

-- AlterTable
ALTER TABLE "Prestation" ADD COLUMN     "category" "OnglerieCategory";
