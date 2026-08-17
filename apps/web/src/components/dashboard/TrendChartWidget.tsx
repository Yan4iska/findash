import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTrend } from "../../hooks/useAnalytics.js";
import { formatCurrency, formatDate, getDefaultDateRange } from "../../utils/format.js";
import { LoadingSpinner } from "../LoadingSpinner/LoadingSpinner.js";
import { ErrorMessage } from "../ErrorMessage/ErrorMessage.js";
import styles from "./widgets.module.css";

interface TrendChartWidgetProps {
  title?: string;
}

export function TrendChartWidget({
  title = "Income vs Expense",
}: TrendChartWidgetProps) {
  const range = getDefaultDateRange();
  const { data, isLoading, error } = useTrend({ ...range, granularity: "day" });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage>Failed to load trend</ErrorMessage>;

  const chartData =
    data?.map((point) => ({
      ...point,
      label: formatDate(point.date),
    })) ?? [];

  if (chartData.length === 0) {
    return (
      <div className={styles.widget}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.statLabel}>No trend data for this period</p>
      </div>
    );
  }

  return (
    <div className={styles.widget}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.content}>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
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
      </div>
    </div>
  );
}
