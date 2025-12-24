-- AlterTable: Remove id column and change primary key to composite key (itemId, uomCode) in ItemUOM

-- Step 1: Drop the old primary key constraint
ALTER TABLE "ItemUOM" DROP CONSTRAINT "item_uoms_pkey";

-- Step 2: Drop the unique constraint (it will be replaced by the primary key)
ALTER TABLE "ItemUOM" DROP CONSTRAINT "item_uoms_itemId_uomCode_key";

-- Step 3: Drop the id column
ALTER TABLE "ItemUOM" DROP COLUMN "id";

-- Step 4: Add the new composite primary key
ALTER TABLE "ItemUOM" ADD CONSTRAINT "ItemUOM_pkey" PRIMARY KEY ("itemId", "uomCode");
