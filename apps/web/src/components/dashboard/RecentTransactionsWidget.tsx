import { Link } from "react-router-dom";
import { useTransactions } from "../../hooks/useTransactions.js";
import { useCategories } from "../../hooks/useCategories.js";
import { formatCurrency, formatDate } from "../../utils/format.js";
import { LoadingSpinner } from "../LoadingSpinner/LoadingSpinner.js";
import { ErrorMessage } from "../ErrorMessage/ErrorMessage.js";
import styles from "./widgets.module.css";

interface RecentTransactionsWidgetProps {
  title?: string;
}

export function RecentTransactionsWidget({
  title = "Recent Transactions",
}: RecentTransactionsWidgetProps) {
  const { data, isLoading, error } = useTransactions({ page: 1, limit: 5 });
  const { data: categories } = useCategories();

  const categoryMap = new Map(
    categories?.map((c) => [c.id, c.name]) ?? [],
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage>Failed to load transactions</ErrorMessage>;

  const items = data?.items ?? [];

  return (
    <div className={styles.widget}>
      <h3 className={styles.title}>{title}</h3>
      {items.length === 0 ? (
        <p className={styles.statLabel}>No transactions yet</p>
      ) : (
        <ul className={styles.content}>
          {items.map((tx) => (
            <li
              key={tx.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "var(--space-sm) 0",
                borderBottom: "1px solid var(--color-border)",
                fontSize: "var(--font-size-sm)",
              }}
            >
              <div>
                <div>{tx.description ?? categoryMap.get(tx.categoryId) ?? "—"}</div>
                <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-xs)" }}>
                  {formatDate(tx.date)}
                </div>
              </div>
              <span
                className={tx.type === "income" ? styles.income : styles.expense}
                style={{ fontWeight: 600 }}
              >
                {tx.type === "expense" ? "−" : "+"}
                {formatCurrency(tx.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}
      <Link
        to="/transactions"
        style={{
          marginTop: "var(--space-sm)",
          fontSize: "var(--font-size-sm)",
        }}
      >
        View all →
      </Link>
    </div>
  );
}
