-- Add publicId column to SOHeader (nullable first)
ALTER TABLE "SOHeader" ADD COLUMN "publicId" CHAR(26);

-- Add publicId column to SODetail (nullable first)
ALTER TABLE "SODetail" ADD COLUMN "publicId" CHAR(26);

-- Generate temporary ULID-format values for existing records
-- Format: timestamp(10 chars) + random(16 chars) in base32-like format
-- This ensures 26 characters using allowed ULID characters

-- Helper function to generate ULID-like string
CREATE OR REPLACE FUNCTION generate_temp_ulid() RETURNS CHAR(26) AS $$
DECLARE
  timestamp_part TEXT;
  random_part TEXT;
  ulid_chars TEXT := '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
BEGIN
  -- Generate 26 random characters from ULID charset
  SELECT string_agg(
    substring(ulid_chars, floor(random() * 32 + 1)::int, 1),
    ''
  )
  INTO random_part
  FROM generate_series(1, 26);

  RETURN random_part;
END;
$$ LANGUAGE plpgsql;

-- Update existing SOHeader records
UPDATE "SOHeader"
SET "publicId" = generate_temp_ulid()
WHERE "publicId" IS NULL;

-- Update existing SODetail records
UPDATE "SODetail"
SET "publicId" = generate_temp_ulid()
WHERE "publicId" IS NULL;

-- Drop helper function
DROP FUNCTION generate_temp_ulid();

-- Now make the column NOT NULL
ALTER TABLE "SOHeader" ALTER COLUMN "publicId" SET NOT NULL;
ALTER TABLE "SODetail" ALTER COLUMN "publicId" SET NOT NULL;

-- Add unique constraints
ALTER TABLE "SOHeader" ADD CONSTRAINT "SOHeader_publicId_key" UNIQUE ("publicId");
ALTER TABLE "SODetail" ADD CONSTRAINT "SODetail_publicId_key" UNIQUE ("publicId");

-- Create indexes for fast lookups
CREATE INDEX "SOHeader_publicId_idx" ON "SOHeader"("publicId");
CREATE INDEX "SODetail_publicId_idx" ON "SODetail"("publicId");
