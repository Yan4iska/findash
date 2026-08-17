import { useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Button } from '../../components/Button/Button.js';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage.js';
import { Input } from '../../components/Input/Input.js';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner.js';
import { Select } from '../../components/Select/Select.js';
import { useCategories } from '../../hooks/useCategories.js';
import {
  useCreateGoal,
  useCreateRecurring,
  useDeleteGoal,
  useDeleteRecurring,
  useForecast,
  useRecurring,
} from '../../hooks/useForecast.js';
import { formatCurrency, formatDate } from '../../utils/format.js';
import pageStyles from '../shared/Page.module.css';
import styles from './ForecastPage.module.css';

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function ForecastPage() {
  const [days, setDays] = useState(90);
  const [recurring, setRecurring] = useState({
    categoryId: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    frequency: 'monthly' as 'weekly' | 'monthly',
    nextDate: today(),
    description: '',
  });
  const [goal, setGoal] = useState({ name: '', targetAmount: '', targetDate: today() });
  const forecast = useForecast(days);
  const categories = useCategories();
  const recurringList = useRecurring();
  const createRecurring = useCreateRecurring();
  const removeRecurring = useDeleteRecurring();
  const createGoal = useCreateGoal();
  const removeGoal = useDeleteGoal();
  const chartData =
    forecast.data?.points.map((point) => ({ ...point, label: formatDate(point.date) })) ?? [];
  const endBalance = forecast.data?.points.at(-1)?.balance ?? 0;

  const submitRecurring = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!recurring.categoryId || Number(recurring.amount) <= 0) return;
    await createRecurring.mutateAsync({
      ...recurring,
      amount: Number(recurring.amount),
      description: recurring.description || undefined,
    });
    setRecurring((current) => ({ ...current, amount: '', description: '' }));
  };
  const submitGoal = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!goal.name || Number(goal.targetAmount) <= 0) return;
    await createGoal.mutateAsync({ ...goal, targetAmount: Number(goal.targetAmount) });
    setGoal({ name: '', targetAmount: '', targetDate: today() });
  };

  if (forecast.isLoading || categories.isLoading) return <LoadingSpinner />;
  if (forecast.error || categories.error)
    return <ErrorMessage>Failed to load your forecast.</ErrorMessage>;

  return (
    <div>
      <div className={pageStyles.pageHeader}>
        <div>
          <h1 className={pageStyles.pageTitle}>Cash flow forecast</h1>
          <p className={pageStyles.pageSubtitle}>
            See whether your plans stay funded before money leaves your account.
          </p>
        </div>
      </div>
      <div className={styles.toolbar}>
        <div className={styles.periods} role="group" aria-label="Forecast period">
          {[30, 60, 90].map((value) => (
            <Button
              key={value}
              small
              variant={days === value ? 'primary' : 'secondary'}
              onClick={() => setDays(value)}
            >
              {value} days
            </Button>
          ))}
        </div>
        <div className={styles.balance}>
          <span>Projected balance</span>
          <strong className={endBalance < 0 ? styles.negative : ''}>
            {formatCurrency(endBalance)}
          </strong>
        </div>
      </div>
      <section className={styles.chartCard} aria-label="Projected balance chart">
        <h2>Balance outlook</h2>
        <p>Based on recorded transactions and your recurring schedule.</p>
        {chartData.length > 0 && (
          <ResponsiveContainer width="100%" height={290}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="forecastFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} minTickGap={45} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 4" />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#forecastFill)"
                name="Projected balance"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </section>
      {forecast.data?.alerts.length ? (
        <section className={styles.alerts} aria-label="Forecast alerts">
          {forecast.data.alerts.map((alert, index) => (
            <div key={`${alert.type}-${index}`} className={styles.alert}>
              <strong>{alert.type === 'low_balance' ? 'Balance risk' : 'Goal at risk'}</strong>
              <span>
                {alert.message}
                {alert.date ? ` ${formatDate(alert.date)}.` : ''}
              </span>
            </div>
          ))}
        </section>
      ) : (
        <section className={styles.safe}>
          <strong>On track</strong>
          <span>Your forecast stays positive and all current goals are funded.</span>
        </section>
      )}
      <div className={styles.columns}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Recurring cash flow</h2>
              <p>Add salary, rent, subscriptions and other predictable payments.</p>
            </div>
          </div>
          <form className={styles.form} onSubmit={(event) => void submitRecurring(event)}>
            <Select
              label="Category"
              value={recurring.categoryId}
              required
              onChange={(e) => setRecurring({ ...recurring, categoryId: e.target.value })}
            >
              <option value="">Choose a category</option>
              {categories.data?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
            <Input
              label="Amount"
              type="number"
              min="0.01"
              step="0.01"
              required
              value={recurring.amount}
              onChange={(e) => setRecurring({ ...recurring, amount: e.target.value })}
            />
            <Select
              label="Type"
              value={recurring.type}
              onChange={(e) =>
                setRecurring({ ...recurring, type: e.target.value as 'income' | 'expense' })
              }
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </Select>
            <Select
              label="Repeats"
              value={recurring.frequency}
              onChange={(e) =>
                setRecurring({ ...recurring, frequency: e.target.value as 'weekly' | 'monthly' })
              }
            >
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
            </Select>
            <Input
              label="First date"
              type="date"
              required
              value={recurring.nextDate}
              onChange={(e) => setRecurring({ ...recurring, nextDate: e.target.value })}
            />
            <Input
              label="Description (optional)"
              value={recurring.description}
              onChange={(e) => setRecurring({ ...recurring, description: e.target.value })}
            />
            <Button type="submit" disabled={createRecurring.isPending}>
              Add recurring item
            </Button>
          </form>
          <div className={styles.list}>
            {recurringList.data?.map((item) => (
              <div className={styles.listItem} key={item.id}>
                <div>
                  <strong>
                    {item.description ||
                      `${item.type === 'income' ? 'Income' : 'Expense'} · ${item.frequency}`}
                  </strong>
                  <span>
                    {formatCurrency(item.amount)} · starts {formatDate(item.nextDate)}
                  </span>
                </div>
                <Button
                  small
                  variant="ghost"
                  aria-label={`Delete ${item.description || 'recurring item'}`}
                  onClick={() => void removeRecurring.mutateAsync(item.id)}
                >
                  Remove
                </Button>
              </div>
            )) ?? <p className={styles.empty}>No recurring items yet.</p>}
          </div>
        </section>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Savings goals</h2>
              <p>Test whether your projected balance can cover an important purchase.</p>
            </div>
          </div>
          <form className={styles.form} onSubmit={(event) => void submitGoal(event)}>
            <Input
              label="Goal name"
              required
              value={goal.name}
              placeholder="New laptop"
              onChange={(e) => setGoal({ ...goal, name: e.target.value })}
            />
            <Input
              label="Target amount"
              type="number"
              min="0.01"
              step="0.01"
              required
              value={goal.targetAmount}
              onChange={(e) => setGoal({ ...goal, targetAmount: e.target.value })}
            />
            <Input
              label="Target date"
              type="date"
              required
              value={goal.targetDate}
              onChange={(e) => setGoal({ ...goal, targetDate: e.target.value })}
            />
            <Button type="submit" disabled={createGoal.isPending}>
              Add goal
            </Button>
          </form>
          <div className={styles.list}>
            {forecast.data?.goals.map((item) => (
              <div className={styles.listItem} key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <span>
                    {formatCurrency(item.targetAmount)} by {formatDate(item.targetDate)} ·{' '}
                    <b className={item.onTrack ? styles.onTrack : styles.atRisk}>
                      {item.onTrack ? 'on track' : 'at risk'}
                    </b>
                  </span>
                </div>
                <Button
                  small
                  variant="ghost"
                  aria-label={`Delete ${item.name}`}
                  onClick={() => void removeGoal.mutateAsync(item.id)}
                >
                  Remove
                </Button>
              </div>
            )) ?? <p className={styles.empty}>No goals yet.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
