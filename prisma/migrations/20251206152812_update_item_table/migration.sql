/*
  Warnings:

  - You are about to drop the column `unitPrice` on the `Item` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Item" DROP COLUMN "unitPrice",
ADD COLUMN     "costPrice" DOUBLE PRECISION,
ADD COLUMN     "isManufactured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPurchasable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isSellable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sellingPrice" DOUBLE PRECISION;
