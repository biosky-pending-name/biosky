/**
 * BioSky Shared Package
 *
 * Shared types, utilities, and services for BioSky.
 */

// Re-export types
export * from "./types.js";

// Re-export generated lexicon types and utilities
export * from "./generated/index.js";

// Re-export auth utilities
export * from "./auth/index.js";

// Re-export database
export { Database } from "./database/index.js";
export type { OccurrenceRow, IdentificationRow, ObservationRow } from "./database/index.js";

// Utility to build DATABASE_URL from environment variables
export function getDatabaseUrl(): string {
  // If DB_PASSWORD is set, construct URL from individual components (GCP Secret Manager)
  if (process.env.DB_PASSWORD) {
    const host = process.env.DB_HOST || "localhost";
    const name = process.env.DB_NAME || "biosky";
    const user = process.env.DB_USER || "postgres";
    const password = process.env.DB_PASSWORD;
    return `postgresql://${user}:${password}@/${name}?host=${host}`;
  }
  // Otherwise use DATABASE_URL directly (local dev)
  return process.env.DATABASE_URL || "postgresql://localhost:5432/biosky";
}
