import { useAppDispatch, useAppSelector } from "../../store";
import { openUploadModal } from "../../store/uiSlice";
import styles from "./FAB.module.css";

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
    <button
      className={styles.fab}
      onClick={handleClick}
      title="New occurrence"
    >
      +
    </button>
  );
}
