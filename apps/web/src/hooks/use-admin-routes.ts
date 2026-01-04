"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

export function useAdminRoutes() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const routesQuery = useQuery({
    queryKey: ["admin", "routes"],
    queryFn: async () => {
      const { data } = await apiClient.get<Route[]>(API_ENDPOINTS.ADMIN.ROUTES);
      return data;
    },
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
    routes: routesQuery.data || [],
    isLoading: routesQuery.isLoading,
    isError: routesQuery.isError,
    createRoute: createRouteMutation.mutateAsync,
    isCreating: createRouteMutation.isPending,
    deleteRoute: deleteRouteMutation.mutateAsync,
    isDeleting: deleteRouteMutation.isPending,
  };
}
