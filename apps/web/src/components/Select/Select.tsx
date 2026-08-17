import type { SelectHTMLAttributes, ReactNode } from "react";
import styles from "./Select.module.css";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

export function Select({
  label,
  error,
  id,
  children,
  className,
  ...props
}: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={styles.field}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={[styles.select, className ?? ""].filter(Boolean).join(" ")}
        {...props}
      >
        {children}
      </select>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
