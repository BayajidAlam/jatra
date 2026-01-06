"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
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
    name: string;
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

export function useAdminSchedules(params?: { page?: number; limit?: number; search?: string }) {
  const { page = 1, limit = 10, search = "" } = params || {};
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const schedulesQuery = useQuery({
    queryKey: ["admin", "schedules", page, limit, search],
    queryFn: async (): Promise<SchedulesResponse> => {
      const { data } = await apiClient.get<SchedulesResponse>(
        API_ENDPOINTS.ADMIN.JOURNEYS,
        { params: { page, limit, search } }
      );
      return data;
    },
    placeholderData: keepPreviousData,
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

  const updateScheduleMutation = useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: any }) => {
      const { data } = await apiClient.patch<{ journey: Journey }>(
        `${API_ENDPOINTS.ADMIN.JOURNEYS}/${id}`,
        dto
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "schedules"] });
      toast({
        title: "Schedule Updated",
        description: "The schedule has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update schedule",
        variant: "destructive",
      });
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
    schedules: schedulesQuery.data?.journeys ?? [],
    pagination: schedulesQuery.data?.pagination,
    isLoading: schedulesQuery.isLoading,
    error: schedulesQuery.error,
    refetch: schedulesQuery.refetch,
    createSchedule,
    isCreating,
    updateSchedule: updateScheduleMutation.mutateAsync,
    isUpdating: updateScheduleMutation.isPending,
    deleteSchedule,
    isDeleting,
  };
}
