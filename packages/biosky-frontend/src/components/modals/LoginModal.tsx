import { useState, FormEvent } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { closeLoginModal } from "../../store/uiSlice";
import { getLoginUrl } from "../../services/api";
import { ModalOverlay } from "./ModalOverlay";

export function LoginModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.loginModalOpen);
  const [handle, setHandle] = useState("");

  const handleClose = () => {
    dispatch(closeLoginModal());
    setHandle("");
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = handle.trim();
    if (trimmed) {
      window.location.href = getLoginUrl(trimmed);
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={handleClose} maxWidth="400px">
      <h2>Log in with Bluesky</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="handle-input">Handle</label>
          <input
            type="text"
            id="handle-input"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="e.g., alice.bsky.social"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            justifyContent: "flex-end",
            marginTop: "1rem",
          }}
        >
          <button type="button" className="btn btn-secondary" onClick={handleClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Log in
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}
