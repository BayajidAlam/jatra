"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
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

export function useAdminUsers(params?: { page?: number; limit?: number; search?: string }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const search = params?.search || "";

  const usersQuery = useQuery<UsersResponse>({
    queryKey: ["admin", "users", page, limit, search],
    queryFn: async () => {
      const { data } = await apiClient.get<UsersResponse>(
        API_ENDPOINTS.ADMIN.USERS,
        { params: { page, limit, search } }
      );
      return data;
    },
    placeholderData: keepPreviousData,
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
    users: usersQuery.data?.users ?? [],
    pagination: usersQuery.data?.pagination,
    isLoading: usersQuery.isLoading,
    error: usersQuery.error,
    refetch: usersQuery.refetch,
    updateUser,
    isUpdating,
  };
}
