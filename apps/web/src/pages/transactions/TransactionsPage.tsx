import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { TransactionFilters, TransactionType } from "@findash/shared";
import { DEFAULT_PAGE_SIZE, TRANSACTION_TYPES } from "@findash/shared";
import { Button } from "../../components/Button/Button.js";
import { ErrorMessage } from "../../components/ErrorMessage/ErrorMessage.js";
import { Input } from "../../components/Input/Input.js";
import { LoadingSpinner } from "../../components/LoadingSpinner/LoadingSpinner.js";
import { Select } from "../../components/Select/Select.js";
import { useCategories } from "../../hooks/useCategories.js";
import {
  useExportTransactions,
  useTransactions,
} from "../../hooks/useTransactions.js";
import { downloadBlob } from "../../utils/download.js";
import { formatCurrency, formatDate } from "../../utils/format.js";
import styles from "../shared/Page.module.css";

export function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [type, setType] = useState<TransactionType | "">("");
  const [search, setSearch] = useState("");

  const filters: Partial<TransactionFilters> = useMemo(
    () => ({
      page,
      limit: DEFAULT_PAGE_SIZE,
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(type ? { type } : {}),
      ...(search ? { search } : {}),
    }),
    [page, startDate, endDate, categoryId, type, search],
  );

  const { data, isLoading, error } = useTransactions(filters);
  const { data: categories } = useCategories();
  const exportMutation = useExportTransactions();

  const categoryMap = new Map(
    categories?.map((c) => [c.id, c.name]) ?? [],
  );

  const handleExport = async () => {
    const blob = await exportMutation.mutateAsync(filters);
    downloadBlob(blob, "transactions.csv");
  };

  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    setCategoryId("");
    setType("");
    setSearch("");
    setPage(1);
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Transactions</h1>
          <p className={styles.pageSubtitle}>
            {data ? `${data.total} total` : "Manage your transactions"}
          </p>
        </div>
        <div className={styles.toolbar}>
          <Button
            variant="secondary"
            onClick={() => void handleExport()}
            disabled={exportMutation.isPending}
          >
            Export CSV
          </Button>
          <Link to="/transactions/new">
            <Button>Add transaction</Button>
          </Link>
        </div>
      </div>

      <div className={styles.filters}>
        <Input
          label="Search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Description…"
        />
        <Input
          label="Start date"
          type="date"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
            setPage(1);
          }}
        />
        <Input
          label="End date"
          type="date"
          value={endDate}
          onChange={(e) => {
            setEndDate(e.target.value);
            setPage(1);
          }}
        />
        <Select
          label="Category"
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All categories</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select
          label="Type"
          value={type}
          onChange={(e) => {
            setType(e.target.value as TransactionType | "");
            setPage(1);
          }}
        >
          <option value="">All types</option>
          {TRANSACTION_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </Select>
        <Button variant="ghost" onClick={resetFilters}>
          Clear filters
        </Button>
      </div>

      {isLoading && <LoadingSpinner />}
      {error && <ErrorMessage>Failed to load transactions</ErrorMessage>}

      {data && (
        <>
          <div className={`${styles.tableWrap} ${styles.desktopOnly}`}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((tx) => (
                  <tr key={tx.id}>
                    <td>{formatDate(tx.date)}</td>
                    <td>{tx.description ?? "—"}</td>
                    <td>{categoryMap.get(tx.categoryId) ?? "—"}</td>
                    <td>{tx.type}</td>
                    <td className={tx.type === "income" ? styles.income : styles.expense}>
                      {formatCurrency(tx.amount)}
                    </td>
                    <td>
                      <Link to={`/transactions/${tx.id}/edit`}>Edit</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={`${styles.cardList} ${styles.mobileOnly}`}>
            {data.items.map((tx) => (
              <div key={tx.id} className={styles.txCard}>
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {tx.description ?? categoryMap.get(tx.categoryId)}
                  </div>
                  <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                    {formatDate(tx.date)} · {categoryMap.get(tx.categoryId)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className={tx.type === "income" ? styles.income : styles.expense}>
                    {formatCurrency(tx.amount)}
                  </div>
                  <Link to={`/transactions/${tx.id}/edit`} style={{ fontSize: "var(--font-size-xs)" }}>
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className={styles.pagination}>
              <Button
                variant="secondary"
                small
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span style={{ fontSize: "var(--font-size-sm)" }}>
                Page {data.page} of {data.totalPages}
              </span>
              <Button
                variant="secondary"
                small
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
