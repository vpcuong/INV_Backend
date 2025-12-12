-- CreateEnum
CREATE TYPE "CustomerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLACKLIST');

-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('HQ', 'BILLING', 'SHIPPING', 'FACTORY');

-- CreateEnum
CREATE TYPE "PaymentTermCode" AS ENUM ('COD', 'PREPAID', 'NET7', 'NET15', 'NET30', 'NET45', 'NET60', 'NET90', 'EOM', 'CUSTOM');

-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "customerCode" VARCHAR(50) NOT NULL,
    "customerName" VARCHAR(200) NOT NULL,
    "shortName" VARCHAR(50),
    "taxCode" VARCHAR(50),
    "country" VARCHAR(100),
    "status" "CustomerStatus" NOT NULL DEFAULT 'ACTIVE',
    "note" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" VARCHAR(50),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerAddress" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "addressType" "AddressType" NOT NULL,
    "addressLine" VARCHAR(500) NOT NULL,
    "ward" VARCHAR(100),
    "district" VARCHAR(100),
    "city" VARCHAR(100) NOT NULL,
    "province" VARCHAR(100),
    "country" VARCHAR(100) NOT NULL,
    "postalCode" VARCHAR(20),
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerContact" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "fullName" VARCHAR(200) NOT NULL,
    "position" VARCHAR(100),
    "department" VARCHAR(100),
    "phone" VARCHAR(50),
    "email" VARCHAR(255),
    "zalo" VARCHAR(50),
    "wechat" VARCHAR(50),
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerPaymentTerm" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "paymentTerm" "PaymentTermCode" NOT NULL,
    "creditLimit" DECIMAL(18,2),
    "currency" VARCHAR(10) NOT NULL DEFAULT 'VND',
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" VARCHAR(50),

    CONSTRAINT "CustomerPaymentTerm_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_customerCode_key" ON "Customer"("customerCode");

-- CreateIndex
CREATE INDEX "Customer_customerCode_idx" ON "Customer"("customerCode");

-- CreateIndex
CREATE INDEX "Customer_status_idx" ON "Customer"("status");

-- CreateIndex
CREATE INDEX "CustomerAddress_customerId_idx" ON "CustomerAddress"("customerId");

-- CreateIndex
CREATE INDEX "CustomerAddress_addressType_idx" ON "CustomerAddress"("addressType");

-- CreateIndex
CREATE INDEX "CustomerContact_customerId_idx" ON "CustomerContact"("customerId");

-- CreateIndex
CREATE INDEX "CustomerContact_email_idx" ON "CustomerContact"("email");

-- CreateIndex
CREATE INDEX "CustomerPaymentTerm_customerId_idx" ON "CustomerPaymentTerm"("customerId");

-- CreateIndex
CREATE INDEX "CustomerPaymentTerm_effectiveFrom_effectiveTo_idx" ON "CustomerPaymentTerm"("effectiveFrom", "effectiveTo");

-- AddForeignKey
ALTER TABLE "CustomerAddress" ADD CONSTRAINT "CustomerAddress_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerContact" ADD CONSTRAINT "CustomerContact_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPaymentTerm" ADD CONSTRAINT "CustomerPaymentTerm_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
