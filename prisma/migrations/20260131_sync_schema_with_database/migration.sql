-- Sync database schema with Prisma schema
-- This migration removes tables and columns that were removed from the schema
-- but never migrated in the database

-- Drop materialized view that depends on columns we're removing
DROP MATERIALIZED VIEW IF EXISTS "community_ids";

-- Drop duplicate indexes
DROP INDEX IF EXISTS "idx_identifications_did";
DROP INDEX IF EXISTS "idx_occurrences_did";

-- Drop foreign key constraint from occurrence_observers before dropping table
ALTER TABLE IF EXISTS "occurrence_observers" DROP CONSTRAINT IF EXISTS "occurrence_observers_occurrence_uri_fkey";

-- Drop tables that are no longer in the schema
DROP TABLE IF EXISTS "oauth_sessions";
DROP TABLE IF EXISTS "oauth_state";
DROP TABLE IF EXISTS "occurrence_observers";
DROP TABLE IF EXISTS "occurrence_private_data";
DROP TABLE IF EXISTS "sensitive_species";

-- Remove index and columns from identifications that are no longer in schema
DROP INDEX IF EXISTS "identifications_subject_idx";
ALTER TABLE "identifications" DROP COLUMN IF EXISTS "subject_index";
ALTER TABLE "identifications" DROP COLUMN IF EXISTS "vernacular_name";
ALTER TABLE "identifications" DROP COLUMN IF EXISTS "kingdom";
ALTER TABLE "identifications" DROP COLUMN IF EXISTS "phylum";
ALTER TABLE "identifications" DROP COLUMN IF EXISTS "class";
ALTER TABLE "identifications" DROP COLUMN IF EXISTS "order";
ALTER TABLE "identifications" DROP COLUMN IF EXISTS "family";
ALTER TABLE "identifications" DROP COLUMN IF EXISTS "genus";
ALTER TABLE "identifications" DROP COLUMN IF EXISTS "confidence";

-- Convert location columns in occurrences from varchar to text
ALTER TABLE "occurrences" ALTER COLUMN "continent" TYPE TEXT;
ALTER TABLE "occurrences" ALTER COLUMN "country" TYPE TEXT;
ALTER TABLE "occurrences" ALTER COLUMN "country_code" TYPE TEXT;
ALTER TABLE "occurrences" ALTER COLUMN "state_province" TYPE TEXT;
ALTER TABLE "occurrences" ALTER COLUMN "county" TYPE TEXT;
ALTER TABLE "occurrences" ALTER COLUMN "municipality" TYPE TEXT;
ALTER TABLE "occurrences" ALTER COLUMN "locality" TYPE TEXT;
ALTER TABLE "occurrences" ALTER COLUMN "water_body" TYPE TEXT;
