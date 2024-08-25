/*
  Warnings:

  - The primary key for the `Referral` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Referral` table. All the data in the column will be lost.
  - Made the column `referralId` on table `Referral` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Referral" DROP CONSTRAINT "Referral_referralId_fkey";

-- AlterTable
CREATE SEQUENCE referral_referralid_seq;
ALTER TABLE "Referral" DROP CONSTRAINT "Referral_pkey",
DROP COLUMN "id",
ADD COLUMN     "userId" INTEGER,
ALTER COLUMN "referralId" SET NOT NULL,
ALTER COLUMN "referralId" SET DEFAULT nextval('referral_referralid_seq'),
ADD CONSTRAINT "Referral_pkey" PRIMARY KEY ("referralId");
ALTER SEQUENCE referral_referralid_seq OWNED BY "Referral"."referralId";

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
