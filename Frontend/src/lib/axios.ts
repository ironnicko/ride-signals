// lib/axios.ts
import axios from "axios";
import { useAuth } from "@/stores/useAuth";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Request interceptor to attach access token
api.interceptors.request.use((config) => {
  const { accessToken } = useAuth.getState();
  if (accessToken) {
    config.headers = config.headers ?? {};
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return config;
});

// Response interceptor to handle 401 and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;
    const { refreshToken, logout } = useAuth.getState();

    if (response?.status === 401 && refreshToken) {
      try {
        // Try refreshing token
        const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: refreshToken }),
        });
        if (!res.ok) throw new Error("Refresh failed");
        const data = await res.json();
        // Update Refreshed Tokens
        useAuth.setState({ accessToken: data.accessToken })
        config.headers["Authorization"] = `Bearer ${data.accessToken}`;

        return api(config); // retry original request
      } catch {
        logout(); // failed refresh → logout
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
