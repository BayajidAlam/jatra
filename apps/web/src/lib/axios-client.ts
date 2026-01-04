import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "./constants";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
});

import { toast } from "@/hooks/use-toast";

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // If we have a token in localStorage, add it to the header
    // This is a fallback if cookies are not used or blocked
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh and error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await apiClient.post(API_ENDPOINTS.AUTH.REFRESH);
        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors with a toast
    if (error.response?.status !== 401 && typeof window !== "undefined") {
        const message = error.response?.data?.message || error.message || "An unexpected error occurred";
        toast({
            title: "Error",
            description: message,
            variant: "destructive",
        });
    }

    return Promise.reject(error);
  }
);

export default apiClient;
