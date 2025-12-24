-- Migration: Use code as primary key for UOM and UOMClass
-- This migration changes UOM and UOMClass to use their code fields as primary keys

-- Step 1: Add new columns with code references (IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ItemUOM' AND column_name='uomCode') THEN
    ALTER TABLE "ItemUOM" ADD COLUMN "uomCode" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='SKUUOM' AND column_name='uomCode') THEN
    ALTER TABLE "SKUUOM" ADD COLUMN "uomCode" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='SODetail' AND column_name='uomCode') THEN
    ALTER TABLE "SODetail" ADD COLUMN "uomCode" VARCHAR(50);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='SupplierItemPackaging' AND column_name='uomCode') THEN
    ALTER TABLE "SupplierItemPackaging" ADD COLUMN "uomCode" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Item' AND column_name='uomCode') THEN
    ALTER TABLE "Item" ADD COLUMN "uomCode" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ItemSKU' AND column_name='uomCode') THEN
    ALTER TABLE "ItemSKU" ADD COLUMN "uomCode" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='UOM' AND column_name='classCode') THEN
    ALTER TABLE "UOM" ADD COLUMN "classCode" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='UOMConversion' AND column_name='fromUOMCode') THEN
    ALTER TABLE "UOMConversion" ADD COLUMN "fromUOMCode" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='UOMConversion' AND column_name='toUOMCode') THEN
    ALTER TABLE "UOMConversion" ADD COLUMN "toUOMCode" TEXT;
  END IF;
END $$;

-- Step 2: Populate new columns with data from existing relationships (only if old columns exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ItemUOM' AND column_name='uomId') THEN
    UPDATE "ItemUOM" SET "uomCode" = (SELECT "code" FROM "UOM" WHERE "UOM"."id" = "ItemUOM"."uomId");
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='SKUUOM' AND column_name='uomId') THEN
    UPDATE "SKUUOM" SET "uomCode" = (SELECT "code" FROM "UOM" WHERE "UOM"."id" = "SKUUOM"."uomId");
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='SODetail' AND column_name='uomId') THEN
    UPDATE "SODetail" SET "uomCode" = (SELECT "code" FROM "UOM" WHERE "UOM"."id" = "SODetail"."uomId");
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='SupplierItemPackaging' AND column_name='uomId') THEN
    UPDATE "SupplierItemPackaging" SET "uomCode" = (SELECT "code" FROM "UOM" WHERE "UOM"."id" = "SupplierItemPackaging"."uomId");
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Item' AND column_name='uomId') THEN
    UPDATE "Item" SET "uomCode" = (SELECT "code" FROM "UOM" WHERE "UOM"."id" = "Item"."uomId");
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ItemSKU' AND column_name='uomId') THEN
    UPDATE "ItemSKU" SET "uomCode" = (SELECT "code" FROM "UOM" WHERE "UOM"."id" = "ItemSKU"."uomId");
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='UOM' AND column_name='classId') THEN
    UPDATE "UOM" SET "classCode" = (SELECT "code" FROM "UOMClass" WHERE "UOMClass"."id" = "UOM"."classId");
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='UOMConversion' AND column_name='fromUOMId') THEN
    UPDATE "UOMConversion" SET "fromUOMCode" = (SELECT "code" FROM "UOM" WHERE "UOM"."id" = "UOMConversion"."fromUOMId");
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='UOMConversion' AND column_name='toUOMId') THEN
    UPDATE "UOMConversion" SET "toUOMCode" = (SELECT "code" FROM "UOM" WHERE "UOM"."id" = "UOMConversion"."toUOMId");
  END IF;
END $$;

-- Step 3: Drop old foreign key constraints
ALTER TABLE "ItemUOM" DROP CONSTRAINT IF EXISTS "item_uoms_uomId_fkey";
ALTER TABLE "SKUUOM" DROP CONSTRAINT IF EXISTS "SKUUOM_uomId_fkey";
ALTER TABLE "SODetail" DROP CONSTRAINT IF EXISTS "SODetail_uomId_fkey";
ALTER TABLE "SODetail" DROP CONSTRAINT IF EXISTS "so_lines_uomId_fkey";
ALTER TABLE "SupplierItemPackaging" DROP CONSTRAINT IF EXISTS "SupplierItemPackaging_uomId_fkey";
ALTER TABLE "Item" DROP CONSTRAINT IF EXISTS "Item_uomId_fkey";
ALTER TABLE "ItemSKU" DROP CONSTRAINT IF EXISTS "ItemSKU_uomId_fkey";
ALTER TABLE "UOM" DROP CONSTRAINT IF EXISTS "UOM_classId_fkey";
ALTER TABLE "UOMConversion" DROP CONSTRAINT IF EXISTS "UOMConversion_fromUOMId_fkey";
ALTER TABLE "UOMConversion" DROP CONSTRAINT IF EXISTS "UOMConversion_toUOMId_fkey";

-- Step 4: Drop old indexes and unique constraints
DROP INDEX IF EXISTS "ix_itemuom_uom";
DROP INDEX IF EXISTS "ix_skuuom_uom";
ALTER TABLE "ItemUOM" DROP CONSTRAINT IF EXISTS "item_uoms_itemId_uomId_key";
ALTER TABLE "SKUUOM" DROP CONSTRAINT IF EXISTS "SKUUOM_skuId_uomId_key";

-- Step 5: Drop old columns (IF EXISTS)
ALTER TABLE "ItemUOM" DROP COLUMN IF EXISTS "uomId";
ALTER TABLE "SKUUOM" DROP COLUMN IF EXISTS "uomId";
ALTER TABLE "SODetail" DROP COLUMN IF EXISTS "uomId";
ALTER TABLE "SupplierItemPackaging" DROP COLUMN IF EXISTS "uomId";
ALTER TABLE "Item" DROP COLUMN IF EXISTS "uomId";
ALTER TABLE "ItemSKU" DROP COLUMN IF EXISTS "uomId";
ALTER TABLE "UOM" DROP COLUMN IF EXISTS "classId";
ALTER TABLE "UOMConversion" DROP COLUMN IF EXISTS "fromUOMId";
ALTER TABLE "UOMConversion" DROP COLUMN IF EXISTS "toUOMId";

-- Step 6: Make new columns NOT NULL
ALTER TABLE "ItemUOM" ALTER COLUMN "uomCode" SET NOT NULL;
ALTER TABLE "SKUUOM" ALTER COLUMN "uomCode" SET NOT NULL;
ALTER TABLE "SODetail" ALTER COLUMN "uomCode" SET NOT NULL;
ALTER TABLE "SupplierItemPackaging" ALTER COLUMN "uomCode" SET NOT NULL;
ALTER TABLE "UOM" ALTER COLUMN "classCode" SET NOT NULL;
ALTER TABLE "UOMConversion" ALTER COLUMN "fromUOMCode" SET NOT NULL;
ALTER TABLE "UOMConversion" ALTER COLUMN "toUOMCode" SET NOT NULL;

-- Step 7: Drop old primary keys and unique constraints on UOM and UOMClass
ALTER TABLE "UOMClass" DROP CONSTRAINT IF EXISTS "UOMClass_pkey";
ALTER TABLE "UOMClass" DROP CONSTRAINT IF EXISTS "UOMClass_code_key";
ALTER TABLE "UOM" DROP CONSTRAINT IF EXISTS "UOM_pkey";
ALTER TABLE "UOM" DROP CONSTRAINT IF EXISTS "UOM_code_key";

-- Step 8: Drop old id columns
ALTER TABLE "UOMClass" DROP COLUMN IF EXISTS "id";
ALTER TABLE "UOM" DROP COLUMN IF EXISTS "id";

-- Step 9: Add new primary keys using code
ALTER TABLE "UOMClass" ADD CONSTRAINT "UOMClass_pkey" PRIMARY KEY ("code");
ALTER TABLE "UOM" ADD CONSTRAINT "UOM_pkey" PRIMARY KEY ("code");

-- Step 10: Add new foreign key constraints
ALTER TABLE "UOM" ADD CONSTRAINT "UOM_classCode_fkey" FOREIGN KEY ("classCode") REFERENCES "UOMClass"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ItemUOM" ADD CONSTRAINT "ItemUOM_uomCode_fkey" FOREIGN KEY ("uomCode") REFERENCES "UOM"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SKUUOM" ADD CONSTRAINT "SKUUOM_uomCode_fkey" FOREIGN KEY ("uomCode") REFERENCES "UOM"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SODetail" ADD CONSTRAINT "SODetail_uomCode_fkey" FOREIGN KEY ("uomCode") REFERENCES "UOM"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SupplierItemPackaging" ADD CONSTRAINT "SupplierItemPackaging_uomCode_fkey" FOREIGN KEY ("uomCode") REFERENCES "UOM"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Item" ADD CONSTRAINT "Item_uomCode_fkey" FOREIGN KEY ("uomCode") REFERENCES "UOM"("code") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ItemSKU" ADD CONSTRAINT "ItemSKU_uomCode_fkey" FOREIGN KEY ("uomCode") REFERENCES "UOM"("code") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "UOMConversion" ADD CONSTRAINT "UOMConversion_fromUOMCode_fkey" FOREIGN KEY ("fromUOMCode") REFERENCES "UOM"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "UOMConversion" ADD CONSTRAINT "UOMConversion_toUOMCode_fkey" FOREIGN KEY ("toUOMCode") REFERENCES "UOM"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 11: Recreate indexes and unique constraints
ALTER TABLE "ItemUOM" ADD CONSTRAINT "item_uoms_itemId_uomCode_key" UNIQUE ("itemId", "uomCode");
CREATE INDEX "ix_itemuom_uom" ON "ItemUOM"("uomCode");
ALTER TABLE "SKUUOM" ADD CONSTRAINT "SKUUOM_skuId_uomCode_key" UNIQUE ("skuId", "uomCode");
CREATE INDEX "ix_skuuom_uom" ON "SKUUOM"("uomCode");
