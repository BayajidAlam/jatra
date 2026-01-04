"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axios-client";
import { API_ENDPOINTS } from "@/lib/constants";
import { User } from "@/types/auth";
import { useToast } from "@/hooks/use-toast";

interface UsersResponse {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function useAdminUsers(params: { page?: number; limit?: number } = {}) {
  const { page = 1, limit = 10 } = params;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<UsersResponse>({
    queryKey: ["admin", "users", page, limit],
    queryFn: async () => {
      const { data } = await apiClient.get<UsersResponse>(API_ENDPOINTS.ADMIN.USERS, {
        params: { page, limit },
      });
      return data;
    },
  });

  const { mutateAsync: updateUser, isPending: isUpdating } = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<User> & { id: string }) => {
      const { data } = await apiClient.patch(`${API_ENDPOINTS.ADMIN.USERS}/${id}`, updateData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast({ title: "Success", description: "User updated successfully" });
    },
  });

  return {
    users: data?.users ?? [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
    updateUser,
    isUpdating,
  };
}
