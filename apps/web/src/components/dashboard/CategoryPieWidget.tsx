import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useCategoryBreakdown } from "../../hooks/useAnalytics.js";
import { getDefaultDateRange } from "../../utils/format.js";
import { formatCurrency } from "../../utils/format.js";
import { LoadingSpinner } from "../LoadingSpinner/LoadingSpinner.js";
import { ErrorMessage } from "../ErrorMessage/ErrorMessage.js";
import styles from "./widgets.module.css";

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

interface CategoryPieWidgetProps {
  title?: string;
}

export function CategoryPieWidget({
  title = "Spending by Category",
}: CategoryPieWidgetProps) {
  const range = getDefaultDateRange();
  const { data, isLoading, error } = useCategoryBreakdown(range);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage>Failed to load breakdown</ErrorMessage>;

  const chartData =
    data?.map((item) => ({
      name: item.categoryName,
      value: item.total,
    })) ?? [];

  if (chartData.length === 0) {
    return (
      <div className={styles.widget}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.statLabel}>No expense data for this period</p>
      </div>
    );
  }

  return (
    <div className={styles.widget}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.content}>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, percent }) =>
                `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
              }
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
