import type { ReactNode } from "react";
import styles from "./ErrorMessage.module.css";

interface ErrorMessageProps {
  children: ReactNode;
}

export function ErrorMessage({ children }: ErrorMessageProps) {
  return (
    <div className={styles.message} role="alert">
      {children}
    </div>
  );
}
