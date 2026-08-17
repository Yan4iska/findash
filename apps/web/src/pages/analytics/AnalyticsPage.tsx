import { useState } from "react";
import type { AnalyticsGranularity } from "@findash/shared";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ErrorMessage } from "../../components/ErrorMessage/ErrorMessage.js";
import { Input } from "../../components/Input/Input.js";
import { LoadingSpinner } from "../../components/LoadingSpinner/LoadingSpinner.js";
import { Select } from "../../components/Select/Select.js";
import {
  useAnalyticsSummary,
  useCategoryBreakdown,
  useTrend,
} from "../../hooks/useAnalytics.js";
import {
  formatCurrency,
  formatDate,
  getDefaultDateRange,
} from "../../utils/format.js";
import pageStyles from "../shared/Page.module.css";
import styles from "./AnalyticsPage.module.css";

const COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#f97316",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
];

export function AnalyticsPage() {
  const defaults = getDefaultDateRange();
  const [startDate, setStartDate] = useState(defaults.startDate);
  const [endDate, setEndDate] = useState(defaults.endDate);
  const [granularity, setGranularity] = useState<AnalyticsGranularity>("day");

  const query = { startDate, endDate, granularity };

  const summary = useAnalyticsSummary({ startDate, endDate });
  const breakdown = useCategoryBreakdown({ startDate, endDate });
  const trend = useTrend(query);

  const isLoading =
    summary.isLoading || breakdown.isLoading || trend.isLoading;
  const hasError = summary.error || breakdown.error || trend.error;

  const pieData =
    breakdown.data?.map((item) => ({
      name: item.categoryName,
      value: item.total,
    })) ?? [];

  const trendData =
    trend.data?.map((point) => ({
      ...point,
      label: formatDate(point.date),
    })) ?? [];

  return (
    <div>
      <div className={pageStyles.pageHeader}>
        <div>
          <h1 className={pageStyles.pageTitle}>Analytics</h1>
          <p className={pageStyles.pageSubtitle}>
            Insights into your spending and income
          </p>
        </div>
      </div>

      <div className={styles.dateRange}>
        <Input
          label="Start date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <Input
          label="End date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <Select
          label="Granularity"
          value={granularity}
          onChange={(e) =>
            setGranularity(e.target.value as AnalyticsGranularity)
          }
        >
          <option value="day">Daily</option>
          <option value="week">Weekly</option>
          <option value="month">Monthly</option>
        </Select>
      </div>

      {isLoading && <LoadingSpinner />}
      {hasError && <ErrorMessage>Failed to load analytics</ErrorMessage>}

      {summary.data && (
        <div className={styles.summaryCards}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>Income</div>
            <div className={`${styles.summaryValue} ${styles.income}`}>
              {formatCurrency(summary.data.totalIncome)}
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>Expenses</div>
            <div className={`${styles.summaryValue} ${styles.expense}`}>
              {formatCurrency(summary.data.totalExpense)}
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>Net</div>
            <div className={styles.summaryValue}>
              {formatCurrency(summary.data.net)}
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>Transactions</div>
            <div className={styles.summaryValue}>
              {summary.data.transactionCount}
            </div>
          </div>
        </div>
      )}

      {!isLoading && !hasError && (
        <div className={styles.charts}>
          <div className={styles.chartCard}>
            <h2 className={styles.chartTitle}>Category breakdown</h2>
            {pieData.length === 0 ? (
              <p style={{ color: "var(--color-text-muted)" }}>No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className={styles.chartCard}>
            <h2 className={styles.chartTitle}>Trend</h2>
            {trendData.length === 0 ? (
              <p style={{ color: "var(--color-text-muted)" }}>No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="#22c55e"
                    fill="#22c55e33"
                    name="Income"
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    stroke="#ef4444"
                    fill="#ef444433"
                    name="Expense"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
