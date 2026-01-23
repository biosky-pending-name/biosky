import { useState, FormEvent } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../store";
import { closeLoginModal } from "../../store/uiSlice";
import { getLoginUrl } from "../../services/api";

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
    <Dialog open={isOpen} onClose={handleClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Log in with Bluesky</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Handle"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="e.g., alice.bsky.social"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            margin="normal"
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Log in
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
