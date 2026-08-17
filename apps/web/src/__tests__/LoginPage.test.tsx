import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "./testUtils.js";

const mockLogin = jest.fn<() => Promise<unknown>>();

await jest.unstable_mockModule("../api/auth.js", () => ({
  login: mockLogin,
  register: jest.fn(),
  logout: jest.fn(),
}));

const { LoginPage } = await import("../pages/auth/LoginPage.js");
const { useAuthStore } = await import("../stores/authStore.js");

describe("LoginPage", () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
    mockLogin.mockReset();
  });

  it("renders sign in form", () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("submits valid credentials", async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({
      accessToken: "access",
      refreshToken: "refresh",
      user: {
        id: "507f1f77bcf86cd799439011",
        email: "test@example.com",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    });

    renderWithProviders(<LoginPage />, {
      routerProps: { initialEntries: ["/login"] },
    });

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });

    expect(useAuthStore.getState().accessToken).toBe("access");
  });
});
