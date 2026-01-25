/**
 * Feed routes - explore feed (public)
 *
 * Note: Home feed (authenticated) stays in appview for now
 * as it requires OAuth agent access.
 */

import { Router } from "express";
import { Database } from "biosky-shared";
import { enrichOccurrences } from "../enrichment.js";
import { logger } from "../middleware/logging.js";

export function createFeedRoutes(db: Database): Router {
  const router = Router();

  // Explore feed - public, with optional filters
  router.get("/explore", async (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query["limit"] as string) || 20, 100);
      const cursor = req.query["cursor"] as string | undefined;
      const taxon = req.query["taxon"] as string | undefined;
      const lat = req.query["lat"] ? parseFloat(req.query["lat"] as string) : undefined;
      const lng = req.query["lng"] ? parseFloat(req.query["lng"] as string) : undefined;
      const radius = req.query["radius"]
        ? parseFloat(req.query["radius"] as string)
        : undefined;

      const rows = await db.getExploreFeed({
        limit,
        ...(cursor && { cursor }),
        ...(taxon && { taxon }),
        ...(lat !== undefined && { lat }),
        ...(lng !== undefined && { lng }),
        ...(radius !== undefined && { radius }),
      });

      const occurrences = await enrichOccurrences(db, rows);

      const lastExploreRow = rows[rows.length - 1];
      const nextCursor =
        rows.length === limit && lastExploreRow
          ? lastExploreRow.created_at.toISOString()
          : undefined;

      res.json({
        occurrences,
        cursor: nextCursor,
        meta: {
          filters: {
            taxon,
            location:
              lat !== undefined && lng !== undefined
                ? { lat, lng, radius: radius || 10000 }
                : undefined,
          },
        },
      });
    } catch (error) {
      logger.error({ err: error }, "Error fetching explore feed");
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return router;
}
