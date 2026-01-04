"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

export function useAdminStations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const stationsQuery = useQuery({
    queryKey: ["admin", "stations"],
    queryFn: async () => {
      const { data } = await apiClient.get<Station[]>(
        API_ENDPOINTS.ADMIN.STATIONS
      );
      return data;
    },
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
    stations: stationsQuery.data || [],
    isLoading: stationsQuery.isLoading,
    isError: stationsQuery.isError,
    createStation: createStationMutation.mutateAsync,
    isCreating: createStationMutation.isPending,
    deleteStation: deleteStationMutation.mutateAsync,
    isDeleting: deleteStationMutation.isPending,
  };
}
