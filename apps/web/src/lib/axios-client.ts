import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "./constants";
import Cookies from "js-cookie";

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
    // If we have a token in cookies, add it to the header
    // We rely on httpOnly cookies for auth, so no need to manually inject token
    // unless strictly required by specific endpoints not covered by cookies.
    if (typeof window !== "undefined") {
       const token = Cookies.get("client_access_token");
       if (token) {
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
        // Refresh failed
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
