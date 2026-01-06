import { create } from "zustand";
import { User, LoginRequest } from "@/types/auth";
import apiClient from "@/lib/axios-client";
import { API_ENDPOINTS } from "@/lib/constants";
import Cookies from "js-cookie";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    }),
  setLoading: (loading) => set({ isLoading: loading }),
  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const payload = {
        identifier: credentials.emailOrPhone,
        password: credentials.password,
      };
      const { data } = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, payload);
      
      if (data.accessToken) {
        Cookies.set("client_access_token", data.accessToken);
      }

      // Fetch user profile immediately
      const userResp = await apiClient.get<{ user: User }>(API_ENDPOINTS.AUTH.ME);
      set({ user: userResp.data.user, isAuthenticated: true, isLoading: false });

    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  logout: async () => {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error("Logout error", error);
    }
    Cookies.remove("client_access_token");
    Cookies.remove("refreshToken");
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
  initialize: async () => {
    set({ isLoading: true });
    try {
      // Try to fetch user profile using httpOnly cookie
      const { data } = await apiClient.get<{ user: User }>(API_ENDPOINTS.AUTH.ME);
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
