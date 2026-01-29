/**
 * Profile routes - user profile feed
 */

import { Router } from "express";
import { Database, getIdentityResolver } from "observing-shared";
import { enrichOccurrences, enrichIdentifications } from "../enrichment.js";
import { logger } from "../middleware/logging.js";

export function createProfileRoutes(db: Database): Router {
  const router = Router();

  // Get profile feed - use regex to capture DID with colons
  router.get(/^\/(.+)\/feed$/, async (req, res) => {
    try {
      const did = decodeURIComponent(req.params[0] ?? "");
      const limit = Math.min(parseInt(req.query["limit"] as string) || 20, 100);
      const cursor = req.query["cursor"] as string | undefined;
      const type =
        (req.query["type"] as "observations" | "identifications" | "all") || "all";

      const { occurrences, identifications, counts } = await db.getProfileFeed(did, {
        limit,
        type,
        ...(cursor && { cursor }),
      });

      // Enrich occurrences
      const enrichedOccurrences = await enrichOccurrences(db, occurrences);

      // Enrich identifications
      const enrichedIdentifications = await enrichIdentifications(identifications);

      // Get profile info
      const resolver = getIdentityResolver();
      const profile = await resolver.getProfile(did);

      // Determine next cursor based on what was returned
      let nextCursor: string | undefined;
      const lastOcc = occurrences[occurrences.length - 1];
      const lastId = identifications[identifications.length - 1];
      if (type === "observations" && occurrences.length === limit && lastOcc) {
        nextCursor = lastOcc.created_at.toISOString();
      } else if (
        type === "identifications" &&
        identifications.length === limit &&
        lastId
      ) {
        nextCursor = lastId.date_identified.toISOString();
      } else if (type === "all") {
        if (lastOcc && lastId) {
          nextCursor =
            lastOcc.created_at < lastId.date_identified
              ? lastOcc.created_at.toISOString()
              : lastId.date_identified.toISOString();
        } else if (lastOcc) {
          nextCursor = lastOcc.created_at.toISOString();
        } else if (lastId) {
          nextCursor = lastId.date_identified.toISOString();
        }
      }

      res.json({
        profile: profile
          ? {
              did: profile.did,
              handle: profile.handle,
              displayName: profile.displayName,
              avatar: profile.avatar,
            }
          : { did },
        counts,
        occurrences: enrichedOccurrences,
        identifications: enrichedIdentifications,
        cursor: nextCursor,
      });
    } catch (error) {
      logger.error({ err: error }, "Error fetching profile feed");
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return router;
}
