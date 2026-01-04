"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axios-client";
import { API_ENDPOINTS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

export interface Train {
  id: string;
  name: string;
  trainNumber: string;
  type: string;
  totalSeats: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTrainDto {
  name: string;
  trainNumber: string;
  type: string;
  totalSeats: number;
}

export interface UpdateTrainDto extends Partial<CreateTrainDto> {
  status?: string;
}

export function useAdminTrains(query?: { page?: number; limit?: number }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const trainsQuery = useQuery({
    queryKey: ["admin", "trains", query],
    queryFn: async () => {
      const { data } = await apiClient.get<{ trains: Train[]; pagination: any }>(
        API_ENDPOINTS.ADMIN.TRAINS,
        { params: query }
      );
      return data;
    },
  });

  const createTrainMutation = useMutation({
    mutationFn: async (dto: CreateTrainDto) => {
      const { data } = await apiClient.post<Train>(
        API_ENDPOINTS.ADMIN.TRAINS,
        dto
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "trains"] });
      toast({
        title: "Train Created",
        description: "The train has been added successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create train",
        variant: "destructive",
      });
    },
  });

  const updateTrainMutation = useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdateTrainDto }) => {
      const { data } = await apiClient.patch<Train>(
        `${API_ENDPOINTS.ADMIN.TRAINS}/${id}`,
        dto
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "trains"] });
      toast({
        title: "Train Updated",
        description: "The train has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update train",
        variant: "destructive",
      });
    },
  });

  const deleteTrainMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`${API_ENDPOINTS.ADMIN.TRAINS}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "trains"] });
      toast({
        title: "Train Deleted",
        description: "The train has been removed successfully.",
        variant: "destructive",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete train",
        variant: "destructive",
      });
    },
  });

  return {
    trains: trainsQuery.data?.trains || [],
    pagination: trainsQuery.data?.pagination,
    isLoading: trainsQuery.isLoading,
    isError: trainsQuery.isError,
    createTrain: createTrainMutation.mutateAsync,
    isCreating: createTrainMutation.isPending,
    updateTrain: updateTrainMutation.mutateAsync,
    isUpdating: updateTrainMutation.isPending,
    deleteTrain: deleteTrainMutation.mutateAsync,
    isDeleting: deleteTrainMutation.isPending,
  };
}
