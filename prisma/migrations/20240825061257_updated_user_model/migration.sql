/*
  Warnings:

  - You are about to drop the column `refreeCount` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Refree` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Refree" DROP CONSTRAINT "Refree_userId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "refreeCount",
ADD COLUMN     "referralCount" INTEGER DEFAULT 0;

-- DropTable
DROP TABLE "Refree";

-- CreateTable
CREATE TABLE "Referral" (
    "id" SERIAL NOT NULL,
    "refreeAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referralId" INTEGER,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Referral_refreeAddress_key" ON "Referral"("refreeAddress");

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
