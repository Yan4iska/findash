import styles from "./LoadingSpinner.module.css";

interface LoadingSpinnerProps {
  centered?: boolean;
}

export function LoadingSpinner({ centered = true }: LoadingSpinnerProps) {
  const spinner = <div className={styles.spinner} role="status" aria-label="Loading" />;
  if (centered) {
    return <div className={styles.centered}>{spinner}</div>;
  }
  return spinner;
}
