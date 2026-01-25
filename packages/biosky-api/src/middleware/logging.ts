/**
 * Logging middleware using pino
 */

import pino from "pino";

// Configure pino for GCP Cloud Logging
export const logger = pino({
  formatters: {
    level(label) {
      const severityMap: Record<string, string> = {
        trace: "DEBUG",
        debug: "DEBUG",
        info: "INFO",
        warn: "WARNING",
        error: "ERROR",
        fatal: "CRITICAL",
      };
      return { severity: severityMap[label] || "DEFAULT" };
    },
  },
});
