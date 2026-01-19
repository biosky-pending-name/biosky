import { Link } from "react-router-dom";
import type { Observation } from "../../services/types";
import { getImageUrl } from "../../services/api";
import styles from "./FeedItem.module.css";

interface FeedItemProps {
  observation: Observation;
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function FeedItem({ observation }: FeedItemProps) {
  const displayName =
    observation.observer.displayName ||
    observation.observer.handle ||
    observation.observer.did.slice(0, 20);
  const handle = observation.observer.handle
    ? `@${observation.observer.handle}`
    : "";
  const timeAgo = formatTimeAgo(new Date(observation.createdAt));
  const species =
    observation.communityId || observation.scientificName || "Unknown species";
  const imageUrl = observation.images[0]
    ? getImageUrl(observation.images[0])
    : "";

  const observationUrl = `/observation/${encodeURIComponent(observation.uri)}`;

  return (
    <Link to={observationUrl} className={styles.item}>
      <div className={styles.avatar}>
        {observation.observer.avatar && (
          <img src={observation.observer.avatar} alt={displayName} />
        )}
      </div>
      <div className={styles.body}>
        <div className={styles.header}>
          <span className={styles.name}>{displayName}</span>
          {handle && <span className={styles.handle}>{handle}</span>}
          <span className={styles.time}>{timeAgo}</span>
        </div>
        <div className={styles.species}>{species}</div>
        {observation.occurrenceRemarks && (
          <div className={styles.notes}>{observation.occurrenceRemarks}</div>
        )}
        {observation.verbatimLocality && (
          <div className={styles.location}>{observation.verbatimLocality}</div>
        )}
        {imageUrl && (
          <div className={styles.image}>
            <img src={imageUrl} alt={species} loading="lazy" />
          </div>
        )}
      </div>
    </Link>
  );
}
