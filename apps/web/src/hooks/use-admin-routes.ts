"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import apiClient from "@/lib/axios-client";
import { API_ENDPOINTS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

export interface Route {
  id: string;
  routeName: string;
  totalDistance: number;
  isActive: boolean;
  stops: any[];
  createdAt: string;
}

export interface CreateRouteDto {
  routeName: string;
  totalDistance: number;
  stops: {
    fromStationId: string;
    toStationId: string;
    stopOrder: number;
    distanceFromStart: number;
    durationMinutes: number;
  }[];
}

export function useAdminRoutes(params?: { page?: number; limit?: number; search?: string }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const search = params?.search || "";

  const routesQuery = useQuery({
    queryKey: ["admin", "routes", page, limit, search],
    queryFn: async (): Promise<{ data: Route[]; meta: any }> => {
      const { data } = await apiClient.get<{ data: Route[]; meta: any }>(
        API_ENDPOINTS.ADMIN.ROUTES,
        { params: { page, limit, search } }
      );
      return data;
    },
    placeholderData: keepPreviousData,
  });

  const createRouteMutation = useMutation({
    mutationFn: async (dto: CreateRouteDto) => {
      const { data } = await apiClient.post<Route>(
        API_ENDPOINTS.ADMIN.ROUTES,
        dto
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "routes"] });
      toast({
        title: "Route Created",
        description: "The route has been added successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create route",
        variant: "destructive",
      });
    },
  });

  const updateRouteMutation = useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: Partial<CreateRouteDto> }) => {
      const { data } = await apiClient.patch<Route>(
        `${API_ENDPOINTS.ADMIN.ROUTES}/${id}`,
        dto
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "routes"] });
      toast({
        title: "Route Updated",
        description: "The route has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update route",
        variant: "destructive",
      });
    },
  });

  const deleteRouteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`${API_ENDPOINTS.ADMIN.ROUTES}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "routes"] });
      toast({
        title: "Route Deleted",
        description: "The route has been removed successfully.",
        variant: "destructive",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete route",
        variant: "destructive",
      });
    },
  });

  return {
    routes: routesQuery.data?.data || [],
    pagination: routesQuery.data?.meta,
    isLoading: routesQuery.isLoading,
    isError: routesQuery.isError,
    createRoute: createRouteMutation.mutateAsync,
    isCreating: createRouteMutation.isPending,
    updateRoute: updateRouteMutation.mutateAsync,
    isUpdating: updateRouteMutation.isPending,
    deleteRoute: deleteRouteMutation.mutateAsync,
    isDeleting: deleteRouteMutation.isPending,
  };
}
