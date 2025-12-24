-- AlterTable
ALTER TABLE "SODetail" RENAME CONSTRAINT "so_lines_pkey" TO "SODetail_pkey";

-- AlterTable
ALTER TABLE "SOHeader" RENAME CONSTRAINT "so_headers_pkey" TO "SOHeader_pkey";

-- CreateTable
CREATE TABLE "item_uoms" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "uomId" INTEGER NOT NULL,
    "toBaseFactor" DECIMAL(18,6) NOT NULL,
    "roundingPrecision" INTEGER DEFAULT 2,
    "isDefaultTransUom" BOOLEAN NOT NULL DEFAULT false,
    "isPurchasingUom" BOOLEAN NOT NULL DEFAULT false,
    "isSalesUom" BOOLEAN NOT NULL DEFAULT false,
    "isManufacturingUom" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "item_uoms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ix_itemuom_item" ON "item_uoms"("itemId");

-- CreateIndex
CREATE INDEX "ix_itemuom_uom" ON "item_uoms"("uomId");

-- CreateIndex
CREATE UNIQUE INDEX "item_uoms_itemId_uomId_key" ON "item_uoms"("itemId", "uomId");

-- RenameForeignKey
ALTER TABLE "SODetail" RENAME CONSTRAINT "so_lines_itemId_fkey" TO "SODetail_itemId_fkey";

-- RenameForeignKey
ALTER TABLE "SODetail" RENAME CONSTRAINT "so_lines_itemSkuId_fkey" TO "SODetail_itemSkuId_fkey";

-- RenameForeignKey
ALTER TABLE "SODetail" RENAME CONSTRAINT "so_lines_soHeaderId_fkey" TO "SODetail_soHeaderId_fkey";

-- RenameForeignKey
ALTER TABLE "SODetail" RENAME CONSTRAINT "so_lines_uomId_fkey" TO "SODetail_uomId_fkey";

-- RenameForeignKey
ALTER TABLE "SOHeader" RENAME CONSTRAINT "so_headers_billingAddressId_fkey" TO "SOHeader_billingAddressId_fkey";

-- RenameForeignKey
ALTER TABLE "SOHeader" RENAME CONSTRAINT "so_headers_customerId_fkey" TO "SOHeader_customerId_fkey";

-- RenameForeignKey
ALTER TABLE "SOHeader" RENAME CONSTRAINT "so_headers_shippingAddressId_fkey" TO "SOHeader_shippingAddressId_fkey";

-- AddForeignKey
ALTER TABLE "item_uoms" ADD CONSTRAINT "item_uoms_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_uoms" ADD CONSTRAINT "item_uoms_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "UOM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "so_lines_itemId_idx" RENAME TO "SODetail_itemId_idx";

-- RenameIndex
ALTER INDEX "so_lines_itemSkuId_idx" RENAME TO "SODetail_itemSkuId_idx";

-- RenameIndex
ALTER INDEX "so_lines_lineStatus_idx" RENAME TO "SODetail_lineStatus_idx";

-- RenameIndex
ALTER INDEX "so_lines_soHeaderId_lineNum_key" RENAME TO "SODetail_soHeaderId_lineNum_key";

-- RenameIndex
ALTER INDEX "so_headers_customerId_idx" RENAME TO "SOHeader_customerId_idx";

-- RenameIndex
ALTER INDEX "so_headers_orderDate_idx" RENAME TO "SOHeader_orderDate_idx";

-- RenameIndex
ALTER INDEX "so_headers_orderStatus_idx" RENAME TO "SOHeader_orderStatus_idx";

-- RenameIndex
ALTER INDEX "so_headers_soNum_idx" RENAME TO "SOHeader_soNum_idx";

-- RenameIndex
ALTER INDEX "so_headers_soNum_key" RENAME TO "SOHeader_soNum_key";
