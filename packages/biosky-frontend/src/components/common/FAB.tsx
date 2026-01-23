import { Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useAppDispatch, useAppSelector } from "../../store";
import { openUploadModal } from "../../store/uiSlice";

export function FAB() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  // Only show FAB when logged in
  if (!user) {
    return null;
  }

  const handleClick = () => {
    dispatch(openUploadModal());
  };

  return (
    <Fab
      color="primary"
      onClick={handleClick}
      title="New occurrence"
      sx={{
        position: "fixed",
        bottom: 80,
        right: 16,
        zIndex: 100,
        "@media (min-width: 640px)": {
          right: "calc(50% - 328px)",
        },
      }}
    >
      <AddIcon />
    </Fab>
  );
}
