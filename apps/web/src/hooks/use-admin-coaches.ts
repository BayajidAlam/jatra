"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
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
    name: string;
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

export function useAdminCoaches(params?: { page?: number; limit?: number; search?: string; trainId?: string }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const search = params?.search || "";
  const trainId = params?.trainId;

  const coachesQuery = useQuery({
    queryKey: ["admin", "coaches", page, limit, search, trainId],
    queryFn: async (): Promise<{ data: Coach[]; meta: any }> => {
      const { data } = await apiClient.get<{ data: Coach[]; meta: any }>(
        API_ENDPOINTS.ADMIN.COACHES,
        { params: { page, limit, search, trainId } }
      );
      return data;
    },
    placeholderData: keepPreviousData,
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
      const { data } = await apiClient.patch(`${API_ENDPOINTS.ADMIN.COACHES}/${id}`, updateData);
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
    coaches: coachesQuery.data?.data || [],
    pagination: coachesQuery.data?.meta,
    isLoading: coachesQuery.isLoading,
    isError: coachesQuery.isError,
    createCoach,
    isCreating,
    updateCoach,
    isUpdating,
    deleteCoach,
    isDeleting,
  };
}
