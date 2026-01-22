import type { IUCNCategory, ConservationStatus as ConservationStatusType } from "../../services/types";
import styles from "./ConservationStatus.module.css";

interface ConservationStatusProps {
  status: ConservationStatusType;
  /** Show full label instead of abbreviation */
  showLabel?: boolean;
  /** Size variant */
  size?: "sm" | "md";
}

const CATEGORY_INFO: Record<IUCNCategory, { label: string; color: string }> = {
  EX: { label: "Extinct", color: "#000000" },
  EW: { label: "Extinct in the Wild", color: "#542344" },
  CR: { label: "Critically Endangered", color: "#d81e05" },
  EN: { label: "Endangered", color: "#fc7f3f" },
  VU: { label: "Vulnerable", color: "#f9e814" },
  NT: { label: "Near Threatened", color: "#cce226" },
  LC: { label: "Least Concern", color: "#60c659" },
  DD: { label: "Data Deficient", color: "#d1d1c6" },
  NE: { label: "Not Evaluated", color: "#ffffff" },
};

/**
 * Displays IUCN Red List conservation status as a colored badge
 */
export function ConservationStatus({
  status,
  showLabel = false,
  size = "md",
}: ConservationStatusProps) {
  const info = CATEGORY_INFO[status.category];
  if (!info) return null;

  const needsDarkText = ["VU", "NT", "LC", "DD", "NE"].includes(status.category);

  return (
    <span
      className={`${styles.badge} ${styles[size]}`}
      style={{
        backgroundColor: info.color,
        color: needsDarkText ? "#1a1a1a" : "#ffffff",
        borderColor: status.category === "NE" ? "#d1d1c6" : info.color,
      }}
      title={`${info.label} (IUCN Red List)`}
    >
      {showLabel ? info.label : status.category}
    </span>
  );
}

/**
 * Returns the display info for an IUCN category
 */
export function getConservationInfo(category: IUCNCategory) {
  return CATEGORY_INFO[category];
}

export type { ConservationStatusProps };
