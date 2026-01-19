import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchObservation, getImageUrl } from "../../services/api";
import { useAppSelector } from "../../store";
import type { Observation } from "../../services/types";
import { IdentificationPanel } from "../identification/IdentificationPanel";
import type { AtpAgent } from "@atproto/api";
import styles from "./ObservationDetail.module.css";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function ObservationDetail() {
  const { uri } = useParams<{ uri: string }>();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  const [observation, setObservation] = useState<Observation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Note: In a full implementation, you would get the agent from context or create it
  // For now, we'll show the identification panel only when logged in
  const [agent, setAgent] = useState<AtpAgent | null>(null);

  useEffect(() => {
    console.log("ObservationDetail - uri param:", uri);
    if (!uri) {
      setError("No observation URI provided");
      setLoading(false);
      return;
    }

    const decodedUri = decodeURIComponent(uri);
    console.log("ObservationDetail - decoded uri:", decodedUri);

    async function loadObservation() {
      setLoading(true);
      setError(null);

      const result = await fetchObservation(decodedUri);
      console.log("ObservationDetail - fetch result:", result);
      if (result?.observation) {
        setObservation(result.observation);
      } else {
        setError("Observation not found");
      }
      setLoading(false);
    }

    loadObservation();
  }, [uri]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleIdentificationSuccess = async () => {
    // Reload the observation to get updated community ID
    if (uri) {
      const result = await fetchObservation(decodeURIComponent(uri));
      if (result?.observation) {
        setObservation(result.observation);
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading observation...</div>
      </div>
    );
  }

  if (error || !observation) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>{error || "Observation not found"}</p>
          <button className="btn btn-secondary" onClick={handleBack}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const displayName =
    observation.observer.displayName ||
    observation.observer.handle ||
    observation.observer.did.slice(0, 20);
  const handle = observation.observer.handle
    ? `@${observation.observer.handle}`
    : "";
  const species =
    observation.communityId || observation.scientificName || "Unknown species";

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={handleBack}>
          ← Back
        </button>
      </header>

      {observation.images.length > 0 && (
        <div className={styles.imageSection}>
          <div className={styles.mainImage}>
            <img
              src={getImageUrl(observation.images[activeImageIndex])}
              alt={species}
            />
          </div>
          {observation.images.length > 1 && (
            <div className={styles.thumbnails}>
              {observation.images.map((img, idx) => (
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

        {observation.scientificName &&
          observation.communityId &&
          observation.scientificName !== observation.communityId && (
            <div className={styles.originalId}>
              Originally identified as: {observation.scientificName}
            </div>
          )}

        <div className={styles.observer}>
          {observation.observer.avatar && (
            <img
              src={observation.observer.avatar}
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
              {formatDate(observation.eventDate)}
            </span>
          </div>

          {observation.verbatimLocality && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Location</span>
              <span className={styles.detailValue}>
                {observation.verbatimLocality}
              </span>
            </div>
          )}

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Coordinates</span>
            <span className={styles.detailValue}>
              {observation.location.latitude.toFixed(5)},{" "}
              {observation.location.longitude.toFixed(5)}
              {observation.location.uncertaintyMeters && (
                <span className={styles.accuracy}>
                  {" "}
                  (±{observation.location.uncertaintyMeters}m)
                </span>
              )}
            </span>
          </div>

          {observation.occurrenceRemarks && (
            <div className={styles.remarks}>
              <span className={styles.detailLabel}>Notes</span>
              <p>{observation.occurrenceRemarks}</p>
            </div>
          )}
        </div>

        {user && agent ? (
          <IdentificationPanel
            observation={{
              uri: observation.uri,
              cid: observation.cid,
              scientificName: observation.scientificName,
              communityId: observation.communityId,
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
