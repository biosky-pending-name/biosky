import { useAppDispatch } from "../../store";
import { openUploadModal } from "../../store/uiSlice";
import styles from "./FAB.module.css";

export function FAB() {
  const dispatch = useAppDispatch();

  const handleClick = () => {
    dispatch(openUploadModal());
  };

  return (
    <button
      className={styles.fab}
      onClick={handleClick}
      title="New observation"
    >
      +
    </button>
  );
}
