import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserPublic } from "@findash/shared";

/**
 * Both access and refresh tokens are stored in localStorage via Zustand persist.
 * This is an httpOnly-less SPA approach: tokens survive page reloads without
 * cookie-based auth. Refresh token rotation is handled by the API client on 401.
 */
interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserPublic | null;
  setAuth: (
    tokens: { accessToken: string; refreshToken: string },
    user: UserPublic,
  ) => void;
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setAuth: (tokens, user) =>
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          user,
        }),
      setTokens: (tokens) =>
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        }),
      clearAuth: () =>
        set({ accessToken: null, refreshToken: null, user: null }),
      isAuthenticated: () => !!get().accessToken,
    }),
    {
      name: "findash-auth",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    },
  ),
);
