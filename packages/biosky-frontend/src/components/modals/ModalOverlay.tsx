import type { ReactNode, MouseEvent } from "react";
import styles from "./ModalOverlay.module.css";

interface ModalOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
}

export function ModalOverlay({
  isOpen,
  onClose,
  children,
  maxWidth,
}: ModalOverlayProps) {
  if (!isOpen) return null;

  const handleOverlayClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal} style={maxWidth ? { maxWidth } : undefined}>
        {children}
      </div>
    </div>
  );
}
