-- CreateTable
CREATE TABLE "interactions" (
    "uri" TEXT NOT NULL,
    "cid" TEXT NOT NULL,
    "did" TEXT NOT NULL,
    "subject_a_occurrence_uri" TEXT,
    "subject_a_occurrence_cid" TEXT,
    "subject_a_subject_index" INTEGER NOT NULL DEFAULT 0,
    "subject_a_taxon_name" TEXT,
    "subject_a_kingdom" TEXT,
    "subject_b_occurrence_uri" TEXT,
    "subject_b_occurrence_cid" TEXT,
    "subject_b_subject_index" INTEGER NOT NULL DEFAULT 0,
    "subject_b_taxon_name" TEXT,
    "subject_b_kingdom" TEXT,
    "interaction_type" TEXT NOT NULL,
    "direction" TEXT NOT NULL DEFAULT 'AtoB',
    "confidence" TEXT,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL,
    "indexed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interactions_pkey" PRIMARY KEY ("uri")
);

-- CreateIndex
CREATE INDEX "interactions_did_idx" ON "interactions"("did");

-- CreateIndex
CREATE INDEX "interactions_subject_a_occurrence_idx" ON "interactions"("subject_a_occurrence_uri");

-- CreateIndex
CREATE INDEX "interactions_subject_b_occurrence_idx" ON "interactions"("subject_b_occurrence_uri");

-- CreateIndex
CREATE INDEX "interactions_type_idx" ON "interactions"("interaction_type");

-- AddForeignKey
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_subject_a_occurrence_uri_fkey" FOREIGN KEY ("subject_a_occurrence_uri") REFERENCES "occurrences"("uri") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_subject_b_occurrence_uri_fkey" FOREIGN KEY ("subject_b_occurrence_uri") REFERENCES "occurrences"("uri") ON DELETE CASCADE ON UPDATE CASCADE;
