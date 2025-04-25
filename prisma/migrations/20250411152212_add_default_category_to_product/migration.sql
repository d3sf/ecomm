-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "defaultCategoryId" INTEGER;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_defaultCategoryId_fkey" FOREIGN KEY ("defaultCategoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
