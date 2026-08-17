export { objectIdSchema, type ObjectId } from './common/objectId.js';

export { isoDateSchema } from './common/dates.js';

export { apiErrorSchema, type ApiError } from './common/apiError.js';

export {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  TRANSACTION_TYPES,
  DEFAULT_CATEGORY_COLORS,
  type TransactionType,
} from './common/constants.js';

export { paginatedResponseSchema, type PaginatedResponse } from './common/pagination.js';

export {
  registerBodySchema,
  loginBodySchema,
  authTokensSchema,
  userPublicSchema,
  type RegisterBody,
  type LoginBody,
  type AuthTokens,
  type UserPublic,
} from './auth/schemas.js';

export {
  categorySchema,
  createCategoryBodySchema,
  updateCategoryBodySchema,
  reorderCategoriesBodySchema,
  type Category,
  type CreateCategoryBody,
  type UpdateCategoryBody,
  type ReorderCategoriesBody,
} from './category/schemas.js';

export {
  transactionTypeSchema,
  transactionSchema,
  createTransactionBodySchema,
  updateTransactionBodySchema,
  transactionFiltersSchema,
  type Transaction,
  type CreateTransactionBody,
  type UpdateTransactionBody,
  type TransactionFilters,
} from './transaction/schemas.js';

export {
  analyticsGranularitySchema,
  analyticsPeriodQuerySchema,
  analyticsSummarySchema,
  categoryBreakdownItemSchema,
  trendPointSchema,
  type AnalyticsGranularity,
  type AnalyticsPeriodQuery,
  type AnalyticsSummary,
  type CategoryBreakdownItem,
  type TrendPoint,
} from './analytics/schemas.js';

export {
  widgetTypeSchema,
  widgetGridSchema,
  widgetConfigSchema,
  dashboardLayoutSchema,
  type WidgetType,
  type WidgetGrid,
  type WidgetConfig,
  type DashboardLayout,
} from './dashboard/schemas.js';

export {
  recurringFrequencySchema,
  recurringTransactionSchema,
  createRecurringTransactionBodySchema,
  savingsGoalSchema,
  createSavingsGoalBodySchema,
  forecastQuerySchema,
  forecastResponseSchema,
  type RecurringTransaction,
  type CreateRecurringTransactionBody,
  type SavingsGoal,
  type CreateSavingsGoalBody,
  type ForecastQuery,
  type ForecastResponse,
} from './forecast/schemas.js';
