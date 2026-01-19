import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { removeToast } from "../../store/uiSlice";
import styles from "./Toast.module.css";

export function ToastContainer() {
  const toasts = useAppSelector((state) => state.ui.toasts);
  const dispatch = useAppDispatch();

  useEffect(() => {
    toasts.forEach((toast) => {
      const timer = setTimeout(() => {
        dispatch(removeToast(toast.id));
      }, 3000);
      return () => clearTimeout(timer);
    });
  }, [toasts, dispatch]);

  if (toasts.length === 0) return null;

  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${styles.toast} ${toast.type === "error" ? styles.error : ""}`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
