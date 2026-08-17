/**
 * Re-exports shared API types and schemas for the web app.
 * Import domain types from here to keep a single source of truth with the API.
 */
export type {
  AnalyticsGranularity,
  AnalyticsPeriodQuery,
  AnalyticsSummary,
  ApiError,
  AuthTokens,
  Category,
  CategoryBreakdownItem,
  CreateCategoryBody,
  CreateTransactionBody,
  DashboardLayout,
  ForecastResponse,
  LoginBody,
  PaginatedResponse,
  RegisterBody,
  RecurringTransaction,
  SavingsGoal,
  CreateRecurringTransactionBody,
  CreateSavingsGoalBody,
  ReorderCategoriesBody,
  Transaction,
  TransactionFilters,
  TransactionType,
  TrendPoint,
  UpdateCategoryBody,
  UpdateTransactionBody,
  UserPublic,
  WidgetConfig,
  WidgetGrid,
  WidgetType,
} from '@findash/shared';

export {
  analyticsPeriodQuerySchema,
  createCategoryBodySchema,
  createTransactionBodySchema,
  dashboardLayoutSchema,
  loginBodySchema,
  registerBodySchema,
  reorderCategoriesBodySchema,
  transactionFiltersSchema,
  updateCategoryBodySchema,
  updateTransactionBodySchema,
} from '@findash/shared';
