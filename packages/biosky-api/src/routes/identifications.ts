/**
 * Identification routes - read-only endpoints
 *
 * Note: POST /api/identifications (create) stays in appview
 * as it requires OAuth agent access.
 */

import { Router } from "express";
import { Database, CommunityIdCalculator } from "biosky-shared";
import { enrichIdentifications } from "../enrichment.js";
import { logger } from "../middleware/logging.js";

export function createIdentificationRoutes(
  db: Database,
  communityId: CommunityIdCalculator
): Router {
  const router = Router();

  // Get identifications for an occurrence
  router.get("/:occurrenceUri(*)", async (req, res) => {
    try {
      const occurrenceUri = req.params["occurrenceUri"];
      if (!occurrenceUri) {
        res.status(400).json({ error: "occurrenceUri is required" });
        return;
      }
      const rows = await db.getIdentificationsForOccurrence(occurrenceUri);
      const identifications = await enrichIdentifications(rows);

      // Calculate community ID
      const communityTaxon = await communityId.calculate(occurrenceUri);

      res.json({
        identifications,
        communityId: communityTaxon,
      });
    } catch (error) {
      logger.error({ err: error }, "Error fetching identifications");
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return router;
}
