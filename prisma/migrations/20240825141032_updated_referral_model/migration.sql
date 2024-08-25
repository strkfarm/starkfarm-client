/*
  Warnings:

  - Made the column `userId` on table `Referral` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Referral" DROP CONSTRAINT "Referral_userId_fkey";

-- AlterTable
ALTER TABLE "Referral" ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
