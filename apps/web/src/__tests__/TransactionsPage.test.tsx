import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "./testUtils.js";

const mockUseTransactions = jest.fn();
const mockUseExportTransactions = jest.fn();
const mockUseCategories = jest.fn();

await jest.unstable_mockModule("../hooks/useTransactions.js", () => ({
  useTransactions: mockUseTransactions,
  useExportTransactions: mockUseExportTransactions,
  useTransaction: jest.fn(),
  useCreateTransaction: jest.fn(),
  useUpdateTransaction: jest.fn(),
  useDeleteTransaction: jest.fn(),
}));

await jest.unstable_mockModule("../hooks/useCategories.js", () => ({
  useCategories: mockUseCategories,
  useCreateCategory: jest.fn(),
  useUpdateCategory: jest.fn(),
  useDeleteCategory: jest.fn(),
  useReorderCategories: jest.fn(),
}));

const { TransactionsPage } = await import("../pages/transactions/TransactionsPage.js");

describe("TransactionsPage", () => {
  beforeEach(() => {
    mockUseCategories.mockReturnValue({
      data: [
        {
          id: "cat1",
          userId: "u1",
          name: "Food",
          color: "#6366f1",
          sortOrder: 0,
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ],
      isLoading: false,
      error: null,
    });

    mockUseTransactions.mockReturnValue({
      data: {
        items: [
          {
            id: "tx1",
            userId: "u1",
            categoryId: "cat1",
            amount: 42.5,
            type: "expense",
            description: "Lunch",
            date: "2026-01-15T00:00:00.000Z",
            createdAt: "2026-01-15T00:00:00.000Z",
            updatedAt: "2026-01-15T00:00:00.000Z",
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      },
      isLoading: false,
      error: null,
    });

    mockUseExportTransactions.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    });
  });

  it("shows transaction list with mocked data", async () => {
    renderWithProviders(<TransactionsPage />);

    await waitFor(() => {
      expect(screen.getAllByText("Lunch").length).toBeGreaterThan(0);
    });

    expect(screen.getByRole("heading", { name: /transactions/i })).toBeInTheDocument();
    expect(screen.getAllByText("$42.50").length).toBeGreaterThan(0);
  });
});
