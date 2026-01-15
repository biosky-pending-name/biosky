-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateTable
CREATE TABLE "ingester_state" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ingester_state_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "occurrences" (
    "uri" TEXT NOT NULL,
    "cid" TEXT NOT NULL,
    "did" TEXT NOT NULL,
    "basis_of_record" TEXT NOT NULL DEFAULT 'HumanObservation',
    "scientific_name" TEXT,
    "event_date" TIMESTAMP(3) NOT NULL,
    "location" geography(Point, 4326) NOT NULL,
    "coordinate_uncertainty_meters" INTEGER,
    "verbatim_locality" TEXT,
    "habitat" TEXT,
    "occurrence_status" TEXT DEFAULT 'present',
    "occurrence_remarks" TEXT,
    "individual_count" INTEGER,
    "sex" TEXT,
    "life_stage" TEXT,
    "reproductive_condition" TEXT,
    "behavior" TEXT,
    "establishment_means" TEXT,
    "associated_media" JSONB,
    "recorded_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL,
    "indexed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "occurrences_pkey" PRIMARY KEY ("uri")
);

-- CreateTable
CREATE TABLE "identifications" (
    "uri" TEXT NOT NULL,
    "cid" TEXT NOT NULL,
    "did" TEXT NOT NULL,
    "subject_uri" TEXT NOT NULL,
    "subject_cid" TEXT NOT NULL,
    "scientific_name" TEXT NOT NULL,
    "taxon_rank" TEXT,
    "identification_qualifier" TEXT,
    "taxon_id" TEXT,
    "identification_remarks" TEXT,
    "identification_verification_status" TEXT,
    "type_status" TEXT,
    "is_agreement" BOOLEAN NOT NULL DEFAULT false,
    "date_identified" TIMESTAMP(3) NOT NULL,
    "indexed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "identifications_pkey" PRIMARY KEY ("uri")
);

-- CreateIndex
CREATE INDEX "occurrences_location_idx" ON "occurrences" USING GIST ("location");

-- CreateIndex
CREATE INDEX "occurrences_scientific_name_idx" ON "occurrences"("scientific_name");

-- CreateIndex
CREATE INDEX "occurrences_did_idx" ON "occurrences"("did");

-- CreateIndex
CREATE INDEX "occurrences_event_date_idx" ON "occurrences"("event_date");

-- CreateIndex
CREATE INDEX "occurrences_basis_of_record_idx" ON "occurrences"("basis_of_record");

-- CreateIndex
CREATE INDEX "identifications_subject_uri_idx" ON "identifications"("subject_uri");

-- CreateIndex
CREATE INDEX "identifications_did_idx" ON "identifications"("did");

-- CreateIndex
CREATE INDEX "identifications_scientific_name_idx" ON "identifications"("scientific_name");

-- AddForeignKey
ALTER TABLE "identifications" ADD CONSTRAINT "identifications_subject_uri_fkey" FOREIGN KEY ("subject_uri") REFERENCES "occurrences"("uri") ON DELETE CASCADE ON UPDATE CASCADE;
