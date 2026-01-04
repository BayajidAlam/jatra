"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axios-client";
import { API_ENDPOINTS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

interface Journey {
  id: string;
  journeyDate: string;
  departureTime: string;
  arrivalTime: string;
  status: string;
  train: {
    id: string;
    modelName: string;
    trainNumber: string;
  };
  route: {
    id: string;
    routeName: string;
  };
}

interface SchedulesResponse {
  journeys: Journey[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function useAdminSchedules(params: { page?: number; limit?: number } = {}) {
  const { page = 1, limit = 10 } = params;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<SchedulesResponse>({
    queryKey: ["admin", "schedules", page, limit],
    queryFn: async () => {
      const { data } = await apiClient.get<SchedulesResponse>(API_ENDPOINTS.ADMIN.JOURNEYS, {
        params: { page, limit },
      });
      return data;
    },
  });

  const { mutateAsync: createSchedule, isPending: isCreating } = useMutation({
    mutationFn: async (scheduleData: any) => {
      const { data } = await apiClient.post(API_ENDPOINTS.ADMIN.JOURNEYS, scheduleData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "schedules"] });
      toast({ title: "Success", description: "Schedule created successfully" });
    },
  });

  const { mutateAsync: deleteSchedule, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`${API_ENDPOINTS.ADMIN.JOURNEYS}/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "schedules"] });
      toast({ title: "Success", description: "Schedule deleted successfully" });
    },
  });

  return {
    schedules: data?.journeys ?? [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
    createSchedule,
    isCreating,
    deleteSchedule,
    isDeleting,
  };
}
