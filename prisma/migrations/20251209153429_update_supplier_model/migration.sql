-- DropForeignKey
ALTER TABLE "ItemRevision" DROP CONSTRAINT "ItemRevision_itemId_fkey";

-- DropForeignKey
ALTER TABLE "ItemSKU" DROP CONSTRAINT "ItemSKU_revisionId_fkey";

-- CreateTable
CREATE TABLE "ItemSupplierUOM" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "fromUOMId" INTEGER NOT NULL,
    "toUOMId" INTEGER NOT NULL,
    "conversionQty" DOUBLE PRECISION NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ItemSupplierUOM_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "address" TEXT,
    "city" TEXT,
    "province" TEXT,
    "country" TEXT,
    "postalCode" TEXT,
    "taxId" TEXT,
    "contactPerson" TEXT,
    "paymentTerms" TEXT,
    "status" TEXT,
    "category" TEXT,
    "rating" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ItemSupplierUOM_itemId_supplierId_fromUOMId_key" ON "ItemSupplierUOM"("itemId", "supplierId", "fromUOMId");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_code_key" ON "Supplier"("code");

-- AddForeignKey
ALTER TABLE "ItemRevision" ADD CONSTRAINT "ItemRevision_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemSKU" ADD CONSTRAINT "ItemSKU_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "ItemRevision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemSupplierUOM" ADD CONSTRAINT "ItemSupplierUOM_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemSupplierUOM" ADD CONSTRAINT "ItemSupplierUOM_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemSupplierUOM" ADD CONSTRAINT "ItemSupplierUOM_fromUOMId_fkey" FOREIGN KEY ("fromUOMId") REFERENCES "UOM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemSupplierUOM" ADD CONSTRAINT "ItemSupplierUOM_toUOMId_fkey" FOREIGN KEY ("toUOMId") REFERENCES "UOM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
