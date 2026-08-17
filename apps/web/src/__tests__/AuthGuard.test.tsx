import { describe, it, expect, beforeEach } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute/ProtectedRoute.js";
import { useAuthStore } from "../stores/authStore.js";

function SecretPage() {
  return <div>Protected content</div>;
}

describe("AuthGuard", () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
  });

  it("redirects unauthenticated users to login", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/login" element={<div>Login page</div>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <SecretPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Login page")).toBeInTheDocument();
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("allows authenticated users through", () => {
    useAuthStore.getState().setAuth(
      { accessToken: "token", refreshToken: "refresh" },
      {
        id: "507f1f77bcf86cd799439011",
        email: "user@example.com",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    );

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/login" element={<div>Login page</div>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <SecretPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });
});
