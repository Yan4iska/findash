import type { AnalyticsPeriodQuery, TransactionFilters } from '@findash/shared';

export const queryKeys = {
  transactions: {
    all: ['transactions'] as const,
    list: (filters: Partial<TransactionFilters>) => ['transactions', 'list', filters] as const,
    detail: (id: string) => ['transactions', 'detail', id] as const,
  },
  categories: {
    all: ['categories'] as const,
  },
  analytics: {
    summary: (query: AnalyticsPeriodQuery) => ['analytics', 'summary', query] as const,
    breakdown: (query: AnalyticsPeriodQuery) => ['analytics', 'breakdown', query] as const,
    trend: (query: AnalyticsPeriodQuery) => ['analytics', 'trend', query] as const,
  },
  dashboard: {
    layout: ['dashboard', 'layout'] as const,
  },
  forecast: {
    all: ['forecast'] as const,
    data: (days: number) => ['forecast', 'data', days] as const,
    recurring: ['forecast', 'recurring'] as const,
    goals: ['forecast', 'goals'] as const,
  },
};
