"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import apiClient from "@/lib/axios-client";
import { API_ENDPOINTS } from "@/lib/constants";
import { User } from "@/types/auth";

export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, setLoading, logout } =
    useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await apiClient.get<{ user: User }>(
          API_ENDPOINTS.AUTH.ME
        );
        setUser(data.user);
      } catch (error) {
        setUser(null);
      }
    };

    checkAuth();
  }, [setUser]);

  return {
    user,
    isAuthenticated,
    isLoading,
    logout,
  };
}
