-- Populate ItemCategory codes
UPDATE "ItemCategory"
SET code = 'CAT' || LPAD(id::text, 4, '0')
WHERE code IS NULL;

-- Populate ItemType codes
UPDATE "ItemType"
SET code = 'TYPE' || LPAD(id::text, 4, '0')
WHERE code IS NULL;

-- Populate Item codes
UPDATE "Item"
SET code = 'ITEM' || LPAD(id::text, 4, '0')
WHERE code IS NULL;

-- Verify results
SELECT 'ItemCategory' as table_name, COUNT(*) as records_with_code FROM "ItemCategory" WHERE code IS NOT NULL
UNION ALL
SELECT 'ItemType' as table_name, COUNT(*) as records_with_code FROM "ItemType" WHERE code IS NOT NULL
UNION ALL
SELECT 'Item' as table_name, COUNT(*) as records_with_code FROM "Item" WHERE code IS NOT NULL;