-- Add publicId column to Item (nullable first)
ALTER TABLE "Item" ADD COLUMN "publicId" CHAR(26);

-- Add publicId column to ItemModel (nullable first)
ALTER TABLE "ItemModel" ADD COLUMN "publicId" CHAR(26);

-- Add publicId column to ItemSKU (nullable first)
ALTER TABLE "ItemSKU" ADD COLUMN "publicId" CHAR(26);

-- Helper function to generate ULID-like string
CREATE OR REPLACE FUNCTION generate_temp_ulid() RETURNS CHAR(26) AS $$
DECLARE
  random_part TEXT;
  ulid_chars TEXT := '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
BEGIN
  SELECT string_agg(
    substring(ulid_chars, floor(random() * 32 + 1)::int, 1),
    ''
  )
  INTO random_part
  FROM generate_series(1, 26);

  RETURN random_part;
END;
$$ LANGUAGE plpgsql;

-- Update existing Item records
UPDATE "Item"
SET "publicId" = generate_temp_ulid()
WHERE "publicId" IS NULL;

-- Update existing ItemModel records
UPDATE "ItemModel"
SET "publicId" = generate_temp_ulid()
WHERE "publicId" IS NULL;

-- Update existing ItemSKU records
UPDATE "ItemSKU"
SET "publicId" = generate_temp_ulid()
WHERE "publicId" IS NULL;

-- Drop helper function
DROP FUNCTION generate_temp_ulid();

-- Now make the columns NOT NULL
ALTER TABLE "Item" ALTER COLUMN "publicId" SET NOT NULL;
ALTER TABLE "ItemModel" ALTER COLUMN "publicId" SET NOT NULL;
ALTER TABLE "ItemSKU" ALTER COLUMN "publicId" SET NOT NULL;

-- Add unique constraints
ALTER TABLE "Item" ADD CONSTRAINT "Item_publicId_key" UNIQUE ("publicId");
ALTER TABLE "ItemModel" ADD CONSTRAINT "ItemModel_publicId_key" UNIQUE ("publicId");
ALTER TABLE "ItemSKU" ADD CONSTRAINT "ItemSKU_publicId_key" UNIQUE ("publicId");

-- Create indexes for fast lookups
CREATE INDEX "Item_publicId_idx" ON "Item"("publicId");
CREATE INDEX "ItemModel_publicId_idx" ON "ItemModel"("publicId");
CREATE INDEX "ItemSKU_publicId_idx" ON "ItemSKU"("publicId");