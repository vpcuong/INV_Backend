-- CreateEnum
CREATE TYPE "SOStatus" AS ENUM ('DRAFT', 'OPEN', 'PARTIAL', 'CLOSED', 'CANCELLED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "SOLineStatus" AS ENUM ('OPEN', 'PARTIAL', 'CLOSED', 'CANCELLED', 'BACKORDERED');

-- CreateTable
CREATE TABLE "so_headers" (
    "id" SERIAL NOT NULL,
    "soNum" VARCHAR(50) NOT NULL,
    "customerId" INTEGER NOT NULL,
    "customerPoNum" VARCHAR(100),
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestDate" TIMESTAMP(3),
    "needByDate" TIMESTAMP(3),
    "orderStatus" "SOStatus" NOT NULL DEFAULT 'OPEN',
    "channel" VARCHAR(50),
    "fobCode" VARCHAR(20),
    "shipViaCode" VARCHAR(20),
    "paymentTermCode" "PaymentTermCode",
    "currencyCode" VARCHAR(3) NOT NULL,
    "exchangeRate" DECIMAL(18,6) NOT NULL DEFAULT 1,
    "discountPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "totalLineAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "totalDiscount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "totalTax" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "totalCharges" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "orderTotal" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "openAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "billingAddressId" INTEGER,
    "shippingAddressId" INTEGER,
    "headerNote" TEXT,
    "internalNote" TEXT,
    "createdBy" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "so_headers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "so_lines" (
    "id" SERIAL NOT NULL,
    "soHeaderId" INTEGER NOT NULL,
    "lineNum" INTEGER NOT NULL,
    "itemId" INTEGER,
    "itemSkuId" INTEGER,
    "itemCode" VARCHAR(50) NOT NULL,
    "description" VARCHAR(500),
    "orderQty" DECIMAL(18,4) NOT NULL,
    "uomId" INTEGER NOT NULL,
    "unitPrice" DECIMAL(18,4) NOT NULL,
    "lineDiscountPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "lineDiscountAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "lineTaxPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "lineTaxAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "lineTotal" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "needByDate" TIMESTAMP(3),
    "lineStatus" "SOLineStatus" NOT NULL DEFAULT 'OPEN',
    "openQty" DECIMAL(18,4) NOT NULL,
    "shippedQty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "warehouseCode" VARCHAR(20),
    "lineNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "so_lines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "so_headers_soNum_key" ON "so_headers"("soNum");

-- CreateIndex
CREATE INDEX "so_headers_customerId_idx" ON "so_headers"("customerId");

-- CreateIndex
CREATE INDEX "so_headers_orderStatus_idx" ON "so_headers"("orderStatus");

-- CreateIndex
CREATE INDEX "so_headers_orderDate_idx" ON "so_headers"("orderDate");

-- CreateIndex
CREATE INDEX "so_headers_soNum_idx" ON "so_headers"("soNum");

-- CreateIndex
CREATE INDEX "so_lines_itemId_idx" ON "so_lines"("itemId");

-- CreateIndex
CREATE INDEX "so_lines_itemSkuId_idx" ON "so_lines"("itemSkuId");

-- CreateIndex
CREATE INDEX "so_lines_lineStatus_idx" ON "so_lines"("lineStatus");

-- CreateIndex
CREATE UNIQUE INDEX "so_lines_soHeaderId_lineNum_key" ON "so_lines"("soHeaderId", "lineNum");

-- AddForeignKey
ALTER TABLE "so_headers" ADD CONSTRAINT "so_headers_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "so_headers" ADD CONSTRAINT "so_headers_billingAddressId_fkey" FOREIGN KEY ("billingAddressId") REFERENCES "CustomerAddress"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "so_headers" ADD CONSTRAINT "so_headers_shippingAddressId_fkey" FOREIGN KEY ("shippingAddressId") REFERENCES "CustomerAddress"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "so_lines" ADD CONSTRAINT "so_lines_soHeaderId_fkey" FOREIGN KEY ("soHeaderId") REFERENCES "so_headers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "so_lines" ADD CONSTRAINT "so_lines_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "so_lines" ADD CONSTRAINT "so_lines_itemSkuId_fkey" FOREIGN KEY ("itemSkuId") REFERENCES "ItemSKU"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "so_lines" ADD CONSTRAINT "so_lines_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "UOM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
