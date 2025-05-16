-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "description" TEXT,
ADD COLUMN     "imageUrl" TEXT;

-- CreateTable
CREATE TABLE "CategoryGrid" (
    "id" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategoryGrid_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CategoryGrid_categoryId_idx" ON "CategoryGrid"("categoryId");

-- AddForeignKey
ALTER TABLE "CategoryGrid" ADD CONSTRAINT "CategoryGrid_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
