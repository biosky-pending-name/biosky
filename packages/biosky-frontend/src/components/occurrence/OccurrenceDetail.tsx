import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchOccurrence, getImageUrl } from "../../services/api";
import { useAppSelector } from "../../store";
import type { Occurrence } from "../../services/types";
import { IdentificationPanel } from "../identification/IdentificationPanel";
import type { AtpAgent } from "@atproto/api";
import styles from "./OccurrenceDetail.module.css";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function OccurrenceDetail() {
  const { uri } = useParams<{ uri: string }>();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  const [occurrence, setOccurrence] = useState<Occurrence | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Note: In a full implementation, you would get the agent from context or create it
  // For now, we'll show the identification panel only when logged in
  const [agent, setAgent] = useState<AtpAgent | null>(null);

  useEffect(() => {
    console.log("OccurrenceDetail - uri param:", uri);
    if (!uri) {
      setError("No occurrence URI provided");
      setLoading(false);
      return;
    }

    const decodedUri = decodeURIComponent(uri);
    console.log("OccurrenceDetail - decoded uri:", decodedUri);

    async function loadOccurrence() {
      setLoading(true);
      setError(null);

      const result = await fetchOccurrence(decodedUri);
      console.log("OccurrenceDetail - fetch result:", result);
      if (result?.occurrence) {
        setOccurrence(result.occurrence);
      } else {
        setError("Occurrence not found");
      }
      setLoading(false);
    }

    loadOccurrence();
  }, [uri]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleIdentificationSuccess = async () => {
    // Reload the occurrence to get updated community ID
    if (uri) {
      const result = await fetchOccurrence(decodeURIComponent(uri));
      if (result?.occurrence) {
        setOccurrence(result.occurrence);
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading occurrence...</div>
      </div>
    );
  }

  if (error || !occurrence) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>{error || "Occurrence not found"}</p>
          <button className="btn btn-secondary" onClick={handleBack}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const displayName =
    occurrence.observer.displayName ||
    occurrence.observer.handle ||
    occurrence.observer.did.slice(0, 20);
  const handle = occurrence.observer.handle
    ? `@${occurrence.observer.handle}`
    : "";
  const species =
    occurrence.communityId || occurrence.scientificName || "Unknown species";

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={handleBack}>
          ← Back
        </button>
      </header>

      {occurrence.images.length > 0 && (
        <div className={styles.imageSection}>
          <div className={styles.mainImage}>
            <img
              src={getImageUrl(occurrence.images[activeImageIndex])}
              alt={species}
            />
          </div>
          {occurrence.images.length > 1 && (
            <div className={styles.thumbnails}>
              {occurrence.images.map((img, idx) => (
                <button
                  key={img}
                  className={`${styles.thumbnail} ${idx === activeImageIndex ? styles.active : ""}`}
                  onClick={() => setActiveImageIndex(idx)}
                >
                  <img src={getImageUrl(img)} alt={`Photo ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className={styles.content}>
        <h1 className={styles.species}>{species}</h1>

        {occurrence.scientificName &&
          occurrence.communityId &&
          occurrence.scientificName !== occurrence.communityId && (
            <div className={styles.originalId}>
              Originally identified as: {occurrence.scientificName}
            </div>
          )}

        <div className={styles.observer}>
          {occurrence.observer.avatar && (
            <img
              src={occurrence.observer.avatar}
              alt={displayName}
              className={styles.avatar}
            />
          )}
          <div className={styles.observerInfo}>
            <span className={styles.name}>{displayName}</span>
            {handle && <span className={styles.handle}>{handle}</span>}
          </div>
        </div>

        <div className={styles.details}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Observed</span>
            <span className={styles.detailValue}>
              {formatDate(occurrence.eventDate)}
            </span>
          </div>

          {occurrence.verbatimLocality && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Location</span>
              <span className={styles.detailValue}>
                {occurrence.verbatimLocality}
              </span>
            </div>
          )}

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Coordinates</span>
            <span className={styles.detailValue}>
              {occurrence.location.latitude.toFixed(5)},{" "}
              {occurrence.location.longitude.toFixed(5)}
              {occurrence.location.uncertaintyMeters && (
                <span className={styles.accuracy}>
                  {" "}
                  (±{occurrence.location.uncertaintyMeters}m)
                </span>
              )}
            </span>
          </div>

          {occurrence.occurrenceRemarks && (
            <div className={styles.remarks}>
              <span className={styles.detailLabel}>Notes</span>
              <p>{occurrence.occurrenceRemarks}</p>
            </div>
          )}
        </div>

        {user && agent ? (
          <IdentificationPanel
            occurrence={{
              uri: occurrence.uri,
              cid: occurrence.cid,
              scientificName: occurrence.scientificName,
              communityId: occurrence.communityId,
            }}
            agent={agent}
            onSuccess={handleIdentificationSuccess}
          />
        ) : (
          <div className={styles.loginPrompt}>
            <p>Log in to add an identification</p>
          </div>
        )}
      </div>
    </div>
  );
}
