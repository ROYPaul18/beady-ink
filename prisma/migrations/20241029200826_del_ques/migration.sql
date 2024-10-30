/*
  Warnings:

  - You are about to drop the column `answeredAsthmaAllergy` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `answeredBloodDisease` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `answeredBloodTransfusion` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `answeredCancerDiagnosis` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `answeredCardiovascularIssue` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `answeredEpilepsy` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `answeredFamilyDiseaseHistory` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `answeredGrowthHormone` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `answeredHIVHepatitis` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `answeredLatexAllergy` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `answeredOrganTransplant` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `answeredRecentMedications` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `answeredRecentTreatment` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `answeredRoaccutaneTreatment` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `answeredSpasmophilia` on the `Reservation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "answeredAsthmaAllergy",
DROP COLUMN "answeredBloodDisease",
DROP COLUMN "answeredBloodTransfusion",
DROP COLUMN "answeredCancerDiagnosis",
DROP COLUMN "answeredCardiovascularIssue",
DROP COLUMN "answeredEpilepsy",
DROP COLUMN "answeredFamilyDiseaseHistory",
DROP COLUMN "answeredGrowthHormone",
DROP COLUMN "answeredHIVHepatitis",
DROP COLUMN "answeredLatexAllergy",
DROP COLUMN "answeredOrganTransplant",
DROP COLUMN "answeredRecentMedications",
DROP COLUMN "answeredRecentTreatment",
DROP COLUMN "answeredRoaccutaneTreatment",
DROP COLUMN "answeredSpasmophilia";
