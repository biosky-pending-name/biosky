import { useEffect } from "react";
import { Stack, Alert } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../store";
import { removeToast } from "../../store/uiSlice";

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
    <Stack
      sx={{
        position: "fixed",
        bottom: 80,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 2000,
      }}
      spacing={1}
    >
      {toasts.map((toast) => (
        <Alert
          key={toast.id}
          severity={toast.type === "error" ? "error" : "success"}
          sx={{
            minWidth: 200,
            animation: "slideIn 0.3s ease-out",
            "@keyframes slideIn": {
              from: { transform: "translateY(100px)", opacity: 0 },
              to: { transform: "translateY(0)", opacity: 1 },
            },
          }}
        >
          {toast.message}
        </Alert>
      ))}
    </Stack>
  );
}
