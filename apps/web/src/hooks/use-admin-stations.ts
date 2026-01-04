"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import apiClient from "@/lib/axios-client";
import { API_ENDPOINTS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

export interface Station {
  id: string;
  name: string;
  code: string;
  city: string;
  createdAt: string;
}

export interface CreateStationDto {
  name: string;
  code: string;
  city: string;
}

export function useAdminStations(params?: { page?: number; limit?: number; search?: string }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const search = params?.search || "";

  const stationsQuery = useQuery({
    queryKey: ["admin", "stations", page, limit, search],
    queryFn: async (): Promise<{ data: Station[]; meta: any }> => {
      const { data } = await apiClient.get<{ data: Station[]; meta: any }>(
        API_ENDPOINTS.ADMIN.STATIONS,
        { params: { page, limit, search } }
      );
      return data;
    },
    placeholderData: keepPreviousData,
  });

  const createStationMutation = useMutation({
    mutationFn: async (dto: CreateStationDto) => {
      const { data } = await apiClient.post<Station>(
        API_ENDPOINTS.ADMIN.STATIONS,
        dto
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "stations"] });
      toast({
        title: "Station Created",
        description: "The station has been added successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create station",
        variant: "destructive",
      });
    },
  });

  const updateStationMutation = useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: Partial<CreateStationDto> }) => {
      const { data } = await apiClient.patch<Station>(
        `${API_ENDPOINTS.ADMIN.STATIONS}/${id}`,
        dto
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "stations"] });
      toast({
        title: "Station Updated",
        description: "The station has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update station",
        variant: "destructive",
      });
    },
  });

  const deleteStationMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`${API_ENDPOINTS.ADMIN.STATIONS}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "stations"] });
      toast({
        title: "Station Deleted",
        description: "The station has been removed successfully.",
        variant: "destructive",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete station",
        variant: "destructive",
      });
    },
  });

  return {
    stations: stationsQuery.data?.data || [],
    pagination: stationsQuery.data?.meta,
    isLoading: stationsQuery.isLoading,
    isError: stationsQuery.isError,
    createStation: createStationMutation.mutateAsync,
    isCreating: createStationMutation.isPending,
    updateStation: updateStationMutation.mutateAsync,
    isUpdating: updateStationMutation.isPending,
    deleteStation: deleteStationMutation.mutateAsync,
    isDeleting: deleteStationMutation.isPending,
  };
}
