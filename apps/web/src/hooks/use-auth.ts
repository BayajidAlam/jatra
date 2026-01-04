"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import apiClient from "@/lib/axios-client";
import { API_ENDPOINTS } from "@/lib/constants";
import { User } from "@/types/auth";

export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, setLoading, logout } =
    useAuthStore();

  // Auth state is managed by AuthProvider which calls useAuthStore.initialize()
  // We just expose the state here

  return {
    user,
    isAuthenticated,
    isLoading,
    logout,
  };
}
