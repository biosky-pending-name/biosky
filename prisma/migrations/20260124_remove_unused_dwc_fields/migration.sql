-- Remove unused Darwin Core fields from occurrences table
-- These fields were not exposed in the lexicon and always set to NULL or default values

-- Drop the index on basis_of_record first
DROP INDEX IF EXISTS occurrences_basis_of_record_idx;

-- Remove columns
ALTER TABLE "occurrences" DROP COLUMN IF EXISTS "basis_of_record";
ALTER TABLE "occurrences" DROP COLUMN IF EXISTS "habitat";
ALTER TABLE "occurrences" DROP COLUMN IF EXISTS "occurrence_status";
ALTER TABLE "occurrences" DROP COLUMN IF EXISTS "individual_count";
ALTER TABLE "occurrences" DROP COLUMN IF EXISTS "sex";
ALTER TABLE "occurrences" DROP COLUMN IF EXISTS "life_stage";
ALTER TABLE "occurrences" DROP COLUMN IF EXISTS "reproductive_condition";
ALTER TABLE "occurrences" DROP COLUMN IF EXISTS "behavior";
ALTER TABLE "occurrences" DROP COLUMN IF EXISTS "establishment_means";
