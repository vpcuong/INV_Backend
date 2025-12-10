/*
  Warnings:

  - You are about to drop the `ItemSupplierUOM` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ItemSupplierUOM" DROP CONSTRAINT "ItemSupplierUOM_fromUOMId_fkey";

-- DropForeignKey
ALTER TABLE "ItemSupplierUOM" DROP CONSTRAINT "ItemSupplierUOM_itemId_fkey";

-- DropForeignKey
ALTER TABLE "ItemSupplierUOM" DROP CONSTRAINT "ItemSupplierUOM_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "ItemSupplierUOM" DROP CONSTRAINT "ItemSupplierUOM_toUOMId_fkey";

-- DropTable
DROP TABLE "ItemSupplierUOM";

-- CreateTable
CREATE TABLE "SupplierItem" (
    "id" SERIAL NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "supplierItemCode" TEXT,
    "currency" TEXT,
    "unitPrice" DECIMAL(65,30),
    "leadTimeDays" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplierItemPackaging" (
    "id" SERIAL NOT NULL,
    "supplierItemId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "uomId" INTEGER NOT NULL,
    "qtyPerPrevLevel" INTEGER NOT NULL,
    "qtyToBase" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierItemPackaging_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SupplierItem_supplierId_itemId_key" ON "SupplierItem"("supplierId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierItemPackaging_supplierItemId_level_key" ON "SupplierItemPackaging"("supplierItemId", "level");

-- AddForeignKey
ALTER TABLE "SupplierItem" ADD CONSTRAINT "SupplierItem_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierItem" ADD CONSTRAINT "SupplierItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierItemPackaging" ADD CONSTRAINT "SupplierItemPackaging_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "UOM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierItemPackaging" ADD CONSTRAINT "SupplierItemPackaging_supplierItemId_fkey" FOREIGN KEY ("supplierItemId") REFERENCES "SupplierItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
