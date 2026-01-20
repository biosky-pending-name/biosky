import { useState, FormEvent } from "react";
import { IdentificationService, type ConfidenceLevel } from "../../lib/identification";
import type { AtpAgent } from "@atproto/api";
import styles from "./IdentificationPanel.module.css";

interface IdentificationPanelProps {
  occurrence: {
    uri: string;
    cid: string;
    scientificName?: string;
    communityId?: string;
  };
  agent: AtpAgent;
  onSuccess?: () => void;
}

export function IdentificationPanel({
  occurrence,
  agent,
  onSuccess,
}: IdentificationPanelProps) {
  const [showSuggestForm, setShowSuggestForm] = useState(false);
  const [taxonName, setTaxonName] = useState("");
  const [comment, setComment] = useState("");
  const [confidence, setConfidence] = useState<ConfidenceLevel>("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const service = new IdentificationService(agent);
  const currentId = occurrence.communityId || occurrence.scientificName || "Unknown";

  const handleAgree = async () => {
    setIsSubmitting(true);
    try {
      await service.agree(occurrence.uri, occurrence.cid, currentId);
      alert("Your agreement has been recorded!");
      onSuccess?.();
    } catch (error) {
      alert(`Error: ${(error as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!taxonName.trim()) {
      alert("Please enter a species name");
      return;
    }

    setIsSubmitting(true);
    try {
      await service.suggestId(occurrence.uri, occurrence.cid, taxonName.trim(), {
        comment: comment.trim() || undefined,
        confidence,
      });
      alert("Your identification has been submitted!");
      setShowSuggestForm(false);
      setTaxonName("");
      setComment("");
      onSuccess?.();
    } catch (error) {
      alert(`Error: ${(error as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.currentId}>
        <span className={styles.label}>Community ID:</span>
        <span className={styles.taxon}>{currentId}</span>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.btnAgree}
          onClick={handleAgree}
          disabled={isSubmitting}
        >
          Agree
        </button>
        <button
          className={styles.btnSuggest}
          onClick={() => setShowSuggestForm(true)}
          disabled={isSubmitting}
        >
          Suggest Different ID
        </button>
      </div>

      {showSuggestForm && (
        <form className={styles.suggestForm} onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="taxon-input">Scientific Name</label>
            <input
              type="text"
              id="taxon-input"
              value={taxonName}
              onChange={(e) => setTaxonName(e.target.value)}
              placeholder="Enter species name..."
            />
          </div>
          <div className="form-group">
            <label htmlFor="comment-input">Comment (optional)</label>
            <textarea
              id="comment-input"
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confidence-select">Confidence</label>
            <select
              id="confidence-select"
              value={confidence}
              onChange={(e) => setConfidence(e.target.value as ConfidenceLevel)}
            >
              <option value="high">High - I'm sure</option>
              <option value="medium">Medium</option>
              <option value="low">Low - Best guess</option>
            </select>
          </div>
          <div className={styles.formActions}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowSuggestForm(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              Submit ID
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
