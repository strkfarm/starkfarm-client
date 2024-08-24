-- AlterTable
ALTER TABLE "User" ADD COLUMN     "refreeCount" INTEGER DEFAULT 0;

-- CreateTable
CREATE TABLE "Refree" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,

    CONSTRAINT "Refree_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Refree_address_key" ON "Refree"("address");

-- AddForeignKey
ALTER TABLE "Refree" ADD CONSTRAINT "Refree_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
