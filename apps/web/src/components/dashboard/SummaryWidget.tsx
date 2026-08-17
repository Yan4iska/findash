import { useAnalyticsSummary } from "../../hooks/useAnalytics.js";
import { formatCurrency } from "../../utils/format.js";
import { getDefaultDateRange } from "../../utils/format.js";
import { LoadingSpinner } from "../LoadingSpinner/LoadingSpinner.js";
import { ErrorMessage } from "../ErrorMessage/ErrorMessage.js";
import styles from "./widgets.module.css";

interface SummaryWidgetProps {
  title?: string;
}

export function SummaryWidget({ title = "Overview" }: SummaryWidgetProps) {
  const range = getDefaultDateRange();
  const { data, isLoading, error } = useAnalyticsSummary(range);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage>Failed to load summary</ErrorMessage>;

  return (
    <div className={styles.widget}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.grid}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Income</span>
          <span className={`${styles.statValue} ${styles.income}`}>
            {formatCurrency(data?.totalIncome ?? 0)}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Expenses</span>
          <span className={`${styles.statValue} ${styles.expense}`}>
            {formatCurrency(data?.totalExpense ?? 0)}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Net</span>
          <span className={styles.statValue}>
            {formatCurrency(data?.net ?? 0)}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Transactions</span>
          <span className={styles.statValue}>{data?.transactionCount ?? 0}</span>
        </div>
      </div>
    </div>
  );
}
