/*
  Warnings:

  - You are about to drop the column `stripePaymentIntentId` on the `orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "stripePaymentIntentId";
