/**
 * Taxonomy routes - search, validate, and taxon details
 */

import { Router } from "express";
import { Database, TaxonomyResolver } from "biosky-shared";
import { enrichOccurrences } from "../enrichment.js";
import { logger } from "../middleware/logging.js";

export function createTaxonomyRoutes(
  db: Database,
  taxonomy: TaxonomyResolver
): Router {
  const router = Router();

  // Search taxa
  router.get("/search", async (req, res) => {
    try {
      const query = req.query["q"] as string;
      if (!query || query.length < 2) {
        res.status(400).json({ error: "Query must be at least 2 characters" });
        return;
      }

      const results = await taxonomy.search(query);
      res.json({ results });
    } catch (error) {
      logger.error({ err: error }, "Error searching taxa");
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Validate taxon name
  router.get("/validate", async (req, res) => {
    try {
      const name = req.query["name"] as string;
      if (!name) {
        res.status(400).json({ error: "name parameter required" });
        return;
      }

      const result = await taxonomy.validate(name);
      res.json(result);
    } catch (error) {
      logger.error({ err: error }, "Error validating taxon");
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get taxon details by ID or name
  router.get("/:id", async (req, res) => {
    try {
      const idOrName = decodeURIComponent(req.params["id"] ?? "");

      let taxon;
      if (idOrName.startsWith("gbif:")) {
        taxon = await taxonomy.getById(idOrName);
      } else {
        const validation = await taxonomy.validate(idOrName);
        if (validation.valid && validation.taxon) {
          taxon = await taxonomy.getById(validation.taxon.id);
        } else if (validation.suggestions && validation.suggestions.length > 0) {
          const suggestion = validation.suggestions[0];
          if (suggestion) {
            taxon = await taxonomy.getById(suggestion.id);
          }
        }
      }

      if (!taxon) {
        res.status(404).json({ error: "Taxon not found" });
        return;
      }

      // Get observation count for this taxon
      const observationCount = await db.countOccurrencesByTaxon(
        taxon.scientificName,
        taxon.rank,
        taxon.kingdom,
      );

      res.json({
        ...taxon,
        observationCount,
      });
    } catch (error) {
      logger.error({ err: error }, "Error fetching taxon");
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get occurrences for a taxon
  router.get("/:id/occurrences", async (req, res) => {
    try {
      const idOrName = decodeURIComponent(req.params["id"] ?? "");
      const cursor = req.query["cursor"] as string | undefined;
      const limit = Math.min(parseInt(req.query["limit"] as string) || 20, 100);

      let taxon;
      if (idOrName.startsWith("gbif:")) {
        taxon = await taxonomy.getById(idOrName);
      } else {
        const validation = await taxonomy.validate(idOrName);
        if (validation.valid && validation.taxon) {
          taxon = await taxonomy.getById(validation.taxon.id);
        } else if (validation.suggestions && validation.suggestions.length > 0) {
          const suggestion = validation.suggestions[0];
          if (suggestion) {
            taxon = await taxonomy.getById(suggestion.id);
          }
        }
      }

      if (!taxon) {
        res.status(404).json({ error: "Taxon not found" });
        return;
      }

      const rows = await db.getOccurrencesByTaxon(taxon.scientificName, taxon.rank, {
        limit,
        ...(cursor && { cursor }),
        kingdom: taxon.kingdom,
      });

      const occurrences = await enrichOccurrences(db, rows);

      const nextCursor =
        rows.length === limit
          ? rows[rows.length - 1]?.created_at?.toISOString()
          : undefined;

      res.json({
        occurrences,
        cursor: nextCursor,
      });
    } catch (error) {
      logger.error({ err: error }, "Error fetching taxon occurrences");
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return router;
}
