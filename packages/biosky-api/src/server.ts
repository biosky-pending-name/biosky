/**
 * BioSky API Server
 *
 * Standalone REST API service for read-only biodiversity data endpoints.
 * Handles public API requests; write operations and OAuth remain in appview.
 */

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import {
  Database,
  TaxonomyResolver,
  CommunityIdCalculator,
} from "biosky-shared";
import { createOccurrenceRoutes } from "./routes/occurrences.js";
import { createFeedRoutes } from "./routes/feeds.js";
import { createIdentificationRoutes } from "./routes/identifications.js";
import { createTaxonomyRoutes } from "./routes/taxonomy.js";
import { createProfileRoutes } from "./routes/profiles.js";
import { logger } from "./middleware/logging.js";
import { errorHandler } from "./middleware/error-handler.js";

// Utility to build DATABASE_URL from environment variables
function getDatabaseUrl(): string {
  if (process.env["DB_PASSWORD"]) {
    const host = process.env["DB_HOST"] || "localhost";
    const name = process.env["DB_NAME"] || "biosky";
    const user = process.env["DB_USER"] || "postgres";
    const password = process.env["DB_PASSWORD"];
    return `postgresql://${user}:${password}@/${name}?host=${host}`;
  }
  return process.env["DATABASE_URL"] || "postgresql://localhost:5432/biosky";
}

interface ApiServerConfig {
  port: number;
  databaseUrl: string;
  corsOrigins: string[];
}

export class ApiServer {
  private app: express.Application;
  private config: ApiServerConfig;
  private db: Database;
  private taxonomy: TaxonomyResolver;
  private communityId: CommunityIdCalculator;

  constructor(config: ApiServerConfig) {
    this.config = config;
    this.app = express();
    this.db = new Database(config.databaseUrl);
    this.taxonomy = new TaxonomyResolver();
    this.communityId = new CommunityIdCalculator(this.db);

    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    // JSON body parsing
    this.app.use(express.json({ limit: "50mb" }));

    // CORS
    this.app.use(
      cors({
        origin: this.config.corsOrigins,
        credentials: true,
      })
    );

    // Cookie parsing (for session verification in later phases)
    this.app.use(cookieParser());
  }

  private setupRoutes(): void {
    // Health check
    this.app.get("/health", (_req, res) => {
      res.json({ status: "ok" });
    });

    // API routes
    this.app.use("/api/occurrences", createOccurrenceRoutes(this.db));
    this.app.use("/api/feeds", createFeedRoutes(this.db));
    this.app.use(
      "/api/identifications",
      createIdentificationRoutes(this.db, this.communityId)
    );
    this.app.use("/api/taxa", createTaxonomyRoutes(this.db, this.taxonomy));
    this.app.use("/api/profiles", createProfileRoutes(this.db));

    // Error handler (must be last)
    this.app.use(errorHandler);
  }

  async start(): Promise<void> {
    await this.db.connect();

    return new Promise((resolve) => {
      this.app.listen(this.config.port, () => {
        logger.info({ port: this.config.port }, "API server listening");
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    await this.db.disconnect();
  }
}

// Main entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new ApiServer({
    port: parseInt(process.env["PORT"] || "3002"),
    databaseUrl: getDatabaseUrl(),
    corsOrigins: (process.env["CORS_ORIGINS"] || "http://localhost:5173,http://localhost:3000").split(","),
  });

  process.on("SIGTERM", async () => {
    logger.info("Received SIGTERM, shutting down");
    await server.stop();
    process.exit(0);
  });

  process.on("SIGINT", async () => {
    logger.info("Received SIGINT, shutting down");
    await server.stop();
    process.exit(0);
  });

  server.start().catch((error: unknown) => {
    logger.fatal({ err: error }, "Fatal error");
    process.exit(1);
  });
}
