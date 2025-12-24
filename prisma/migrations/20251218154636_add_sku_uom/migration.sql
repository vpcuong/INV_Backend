-- CreateTable
CREATE TABLE "SKUUOM" (
    "id" SERIAL NOT NULL,
    "skuId" INTEGER NOT NULL,
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

    CONSTRAINT "SKUUOM_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ix_skuuom_sku" ON "SKUUOM"("skuId");

-- CreateIndex
CREATE INDEX "ix_skuuom_uom" ON "SKUUOM"("uomId");

-- CreateIndex
CREATE UNIQUE INDEX "SKUUOM_skuId_uomId_key" ON "SKUUOM"("skuId", "uomId");

-- AddForeignKey
ALTER TABLE "SKUUOM" ADD CONSTRAINT "SKUUOM_skuId_fkey" FOREIGN KEY ("skuId") REFERENCES "ItemSKU"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SKUUOM" ADD CONSTRAINT "SKUUOM_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "UOM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;