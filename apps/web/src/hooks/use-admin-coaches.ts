"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axios-client";
import { API_ENDPOINTS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

interface Coach {
  id: string;
  trainId: string;
  coachCode: string; // e.g., "KA"
  coachType: string; // e.g., "AC_BERTH"
  totalSeats: number;
  train: {
    id: string;
    modelName: string; // In frontend, Train type has modelName
    trainNumber: string;
  };
  _count?: {
      seats: number;
  };
}

interface CoachesResponse {
  coaches: Coach[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function useAdminCoaches(params: { page?: number; limit?: number; trainId?: string } = {}) {
  const { page = 1, limit = 10, trainId } = params;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<CoachesResponse>({
    queryKey: ["admin", "coaches", page, limit, trainId],
    queryFn: async () => {
      const { data } = await apiClient.get<CoachesResponse>(API_ENDPOINTS.ADMIN.COACHES, {
        params: { page, limit, trainId },
      });
      return data;
    },
  });

  const { mutateAsync: createCoach, isPending: isCreating } = useMutation({
    mutationFn: async (coachData: any) => {
      const { data } = await apiClient.post(API_ENDPOINTS.ADMIN.COACHES, coachData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "coaches"] });
      toast({ title: "Success", description: "Coach created successfully" });
    },
  });

  const { mutateAsync: updateCoach, isPending: isUpdating } = useMutation({
    mutationFn: async ({ id, ...updateData }: any & { id: string }) => {
      const { data } = await apiClient.put(`${API_ENDPOINTS.ADMIN.COACHES}/${id}`, updateData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "coaches"] });
      toast({ title: "Success", description: "Coach updated successfully" });
    },
  });

  const { mutateAsync: deleteCoach, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`${API_ENDPOINTS.ADMIN.COACHES}/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "coaches"] });
      toast({ title: "Success", description: "Coach deleted successfully" });
    },
  });

  return {
    coaches: data?.coaches ?? [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
    createCoach,
    isCreating,
    updateCoach,
    isUpdating,
    deleteCoach,
    isDeleting,
  };
}
