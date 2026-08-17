import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "./testUtils.js";

const mockUseDashboardLayout = jest.fn();
const mockUseSaveDashboardLayout = jest.fn();

const layout = {
  widgets: [
    {
      id: "summary",
      type: "summary" as const,
      title: "Overview",
      grid: { x: 0, y: 0, w: 2, h: 1 },
    },
    {
      id: "categoryPie",
      type: "categoryPie" as const,
      title: "Spending by Category",
      grid: { x: 0, y: 1, w: 1, h: 2 },
    },
    {
      id: "trendChart",
      type: "trendChart" as const,
      title: "Income vs Expense",
      grid: { x: 1, y: 1, w: 1, h: 2 },
    },
    {
      id: "recentTransactions",
      type: "recentTransactions" as const,
      title: "Recent Transactions",
      grid: { x: 0, y: 3, w: 2, h: 1 },
    },
  ],
};

await jest.unstable_mockModule("../hooks/useDashboardLayout.js", () => ({
  DEFAULT_DASHBOARD_LAYOUT: layout,
  useDashboardLayout: mockUseDashboardLayout,
  useSaveDashboardLayout: mockUseSaveDashboardLayout,
}));

await jest.unstable_mockModule("../hooks/useAnalytics.js", () => ({
  useAnalyticsSummary: jest.fn(() => ({
    data: { totalIncome: 1000, totalExpense: 500, net: 500, transactionCount: 10 },
    isLoading: false,
    error: null,
  })),
  useCategoryBreakdown: jest.fn(() => ({ data: [], isLoading: false, error: null })),
  useTrend: jest.fn(() => ({ data: [], isLoading: false, error: null })),
}));

await jest.unstable_mockModule("../hooks/useTransactions.js", () => ({
  useTransactions: jest.fn(() => ({ data: { items: [] }, isLoading: false, error: null })),
  useExportTransactions: jest.fn(),
  useTransaction: jest.fn(),
  useCreateTransaction: jest.fn(),
  useUpdateTransaction: jest.fn(),
  useDeleteTransaction: jest.fn(),
}));

await jest.unstable_mockModule("../hooks/useCategories.js", () => ({
  useCategories: jest.fn(() => ({ data: [], isLoading: false, error: null })),
  useCreateCategory: jest.fn(),
  useUpdateCategory: jest.fn(),
  useDeleteCategory: jest.fn(),
  useReorderCategories: jest.fn(),
}));

const { DashboardPage } = await import("../pages/dashboard/DashboardPage.js");

describe("DashboardPage", () => {
  beforeEach(() => {
    mockUseDashboardLayout.mockReturnValue({
      data: layout,
      isLoading: false,
    });
    mockUseSaveDashboardLayout.mockReturnValue({
      mutate: jest.fn(),
    });
  });

  it("renders dashboard widgets", () => {
    renderWithProviders(<DashboardPage />);

    expect(screen.getByRole("heading", { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Drag Overview")).toBeInTheDocument();
    expect(screen.getByLabelText("Drag Spending by Category")).toBeInTheDocument();
    expect(screen.getByLabelText("Drag Income vs Expense")).toBeInTheDocument();
    expect(screen.getByLabelText("Drag Recent Transactions")).toBeInTheDocument();
  });

  it("renders default widgets when a new user has no saved layout", () => {
    mockUseDashboardLayout.mockReturnValue({
      data: { widgets: [] },
      isLoading: false,
    });

    renderWithProviders(<DashboardPage />);

    expect(screen.getByLabelText("Drag Overview")).toBeInTheDocument();
    expect(screen.getByLabelText("Drag Spending by Category")).toBeInTheDocument();
    expect(screen.getByLabelText("Drag Income vs Expense")).toBeInTheDocument();
    expect(screen.getByLabelText("Drag Recent Transactions")).toBeInTheDocument();
  });
});
