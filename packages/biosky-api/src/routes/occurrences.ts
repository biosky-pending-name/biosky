/**
 * Occurrence routes - read-only endpoints
 */

import { Router } from "express";
import { Database, getIdentityResolver } from "biosky-shared";
import { enrichOccurrences, enrichIdentifications, enrichComments } from "../enrichment.js";
import { logger } from "../middleware/logging.js";

export function createOccurrenceRoutes(db: Database): Router {
  const router = Router();

  // Get observers for an occurrence
  router.get("/:uri(*)/observers", async (req, res) => {
    try {
      const occurrenceUri = req.params["uri"];
      if (!occurrenceUri) {
        res.status(400).json({ error: "uri is required" });
        return;
      }

      const occurrence = await db.getOccurrence(occurrenceUri);
      if (!occurrence) {
        res.status(404).json({ error: "Occurrence not found" });
        return;
      }

      const observerData = await db.getOccurrenceObservers(occurrenceUri);

      // Enrich with profile info
      const resolver = getIdentityResolver();
      const dids = observerData.map((o) => o.did);
      const profiles = await resolver.getProfiles(dids);

      const observers = observerData.map((o) => {
        const profile = profiles.get(o.did);
        return {
          did: o.did,
          handle: profile?.handle,
          displayName: profile?.displayName,
          avatar: profile?.avatar,
          role: o.role,
          addedAt: o.addedAt.toISOString(),
        };
      });

      res.json({ observers });
    } catch (error) {
      logger.error({ err: error }, "Error fetching observers");
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get occurrences nearby
  router.get("/nearby", async (req, res) => {
    try {
      const lat = parseFloat(req.query["lat"] as string);
      const lng = parseFloat(req.query["lng"] as string);
      const radius = parseFloat(req.query["radius"] as string) || 10000;
      const limit = parseInt(req.query["limit"] as string) || 100;
      const offset = parseInt(req.query["offset"] as string) || 0;

      if (isNaN(lat) || isNaN(lng)) {
        res.status(400).json({ error: "lat and lng are required" });
        return;
      }

      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        res.status(400).json({ error: "Invalid coordinates" });
        return;
      }

      const rows = await db.getOccurrencesNearby(lat, lng, radius, limit, offset);
      const occurrences = await enrichOccurrences(db, rows);

      res.json({
        occurrences,
        meta: {
          lat,
          lng,
          radius,
          limit,
          offset,
          count: occurrences.length,
        },
      });
    } catch (error) {
      logger.error({ err: error }, "Error fetching nearby occurrences");
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get occurrences feed (chronological)
  router.get("/feed", async (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query["limit"] as string) || 20, 100);
      const cursor = req.query["cursor"] as string | undefined;

      const rows = await db.getOccurrencesFeed(limit, cursor);
      const occurrences = await enrichOccurrences(db, rows);

      const lastRow = rows[rows.length - 1];
      const nextCursor =
        rows.length === limit && lastRow
          ? lastRow.created_at.toISOString()
          : undefined;

      res.json({
        occurrences,
        cursor: nextCursor,
      });
    } catch (error) {
      logger.error({ err: error }, "Error fetching feed");
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get occurrences in bounding box
  router.get("/bbox", async (req, res) => {
    try {
      const minLat = parseFloat(req.query["minLat"] as string);
      const minLng = parseFloat(req.query["minLng"] as string);
      const maxLat = parseFloat(req.query["maxLat"] as string);
      const maxLng = parseFloat(req.query["maxLng"] as string);
      const limit = parseInt(req.query["limit"] as string) || 1000;

      if (isNaN(minLat) || isNaN(minLng) || isNaN(maxLat) || isNaN(maxLng)) {
        res.status(400).json({
          error: "minLat, minLng, maxLat, maxLng are required",
        });
        return;
      }

      const rows = await db.getOccurrencesByBoundingBox(
        minLat,
        minLng,
        maxLat,
        maxLng,
        limit
      );

      const occurrences = await enrichOccurrences(db, rows);

      res.json({
        occurrences,
        meta: {
          bounds: { minLat, minLng, maxLat, maxLng },
          count: occurrences.length,
        },
      });
    } catch (error) {
      logger.error({ err: error }, "Error fetching bbox occurrences");
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get GeoJSON for map clustering (must be before :uri(*) route)
  router.get("/geojson", async (req, res) => {
    try {
      const minLat = parseFloat(req.query["minLat"] as string);
      const minLng = parseFloat(req.query["minLng"] as string);
      const maxLat = parseFloat(req.query["maxLat"] as string);
      const maxLng = parseFloat(req.query["maxLng"] as string);

      if (isNaN(minLat) || isNaN(minLng) || isNaN(maxLat) || isNaN(maxLng)) {
        res.status(400).json({ error: "Bounding box required" });
        return;
      }

      const rows = await db.getOccurrencesByBoundingBox(
        minLat,
        minLng,
        maxLat,
        maxLng,
        5000
      );

      const features = rows.map((row) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [row.longitude, row.latitude],
        },
        properties: {
          uri: row.uri,
          scientificName: row.scientific_name,
          eventDate: row.event_date.toISOString(),
        },
      }));

      res.json({
        type: "FeatureCollection",
        features,
      });
    } catch (error) {
      logger.error({ err: error }, "Error generating GeoJSON");
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get single occurrence (must be after specific routes like /geojson)
  router.get("/:uri(*)", async (req, res) => {
    try {
      const uri = req.params["uri"];
      if (!uri) {
        res.status(400).json({ error: "uri is required" });
        return;
      }
      const row = await db.getOccurrence(uri);

      if (!row) {
        res.status(404).json({ error: "Occurrence not found" });
        return;
      }

      const [occurrence] = await enrichOccurrences(db, [row]);
      const identifications = await db.getIdentificationsForOccurrence(uri);
      const comments = await db.getCommentsForOccurrence(uri);

      res.json({
        occurrence,
        identifications: await enrichIdentifications(identifications),
        comments: await enrichComments(comments),
      });
    } catch (error) {
      logger.error({ err: error }, "Error fetching occurrence");
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return router;
}
