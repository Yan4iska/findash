import type { AuthTokens, LoginBody, RegisterBody, UserPublic } from "./types.js";
import { apiClient } from "./client.js";
import { useAuthStore } from "../stores/authStore.js";

export interface AuthResponse extends AuthTokens {
  user: UserPublic;
}

export async function login(body: LoginBody): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/login", body);
  return data;
}

export async function register(body: RegisterBody): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/register", body);
  return data;
}

export async function logout(): Promise<void> {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (refreshToken) {
    await apiClient.post("/auth/logout", { refreshToken });
  }
}
