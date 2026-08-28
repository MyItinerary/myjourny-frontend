import axios from "axios";
import { clearAuth, getTokens, setTokens } from "@/lib/auth/session-store";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const { accessToken } = getTokens();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

function redirectToLogin() {
  clearAuth();
  if (typeof window !== "undefined") {
    fetch("/api/auth/session", { method: "DELETE" }).catch(() => {});
    window.location.href = "/login";
  }
}

// De-duped across concurrent 401s: a burst of requests that all expire at
// once should trigger a single /auth/refresh call, not one per request.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = getTokens();
  if (!refreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${apiClient.defaults.baseURL}/auth/refresh`, { refresh_token: refreshToken })
      .then((res) => {
        setTokens(res.data);
        return res.data.access_token as string;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      }
      redirectToLogin();
    }
    return Promise.reject(error);
  }
);
