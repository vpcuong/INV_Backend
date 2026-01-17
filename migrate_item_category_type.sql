-- Migration: Convert ItemCategory boolean flags to type enum
-- Step 1: Create enum type if not exists
DO $$ BEGIN
    CREATE TYPE "ItemCategoryType" AS ENUM ('OUT', 'FIG', 'FAB');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Add new type column if not exists
DO $$ BEGIN
    ALTER TABLE "ItemCategory" ADD COLUMN "type" "ItemCategoryType";
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Step 3: Migrate data from boolean flags to enum type
UPDATE "ItemCategory"
SET "type" = 'OUT'
WHERE "isOutsourced" = true AND "type" IS NULL;

UPDATE "ItemCategory"
SET "type" = 'FIG'
WHERE "isFinishedGood" = true AND "type" IS NULL;

UPDATE "ItemCategory"
SET "type" = 'FAB'
WHERE "isFabric" = true AND "type" IS NULL;

-- Step 4: Drop old boolean columns (only if they exist)
DO $$ BEGIN
    ALTER TABLE "ItemCategory" DROP COLUMN IF EXISTS "isOutsourced";
    ALTER TABLE "ItemCategory" DROP COLUMN IF EXISTS "isFinishedGood";
    ALTER TABLE "ItemCategory" DROP COLUMN IF EXISTS "isFabric";
END $$;

-- Verify the migration
SELECT id, code, type, "isActive" FROM "ItemCategory" ORDER BY id;