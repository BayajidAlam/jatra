"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axios-client";
import { API_ENDPOINTS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

interface Seat {
  id: string;
  coachId: string;
  seatNumber: string;
  seatType: string;
  baseFare: number;
  coach: {
    id: string;
    coachCode: string;
    train: {
      name: string;
      trainNumber: string;
    }
  }
}

interface SeatsResponse {
  seats: Seat[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function useAdminSeats(params: { page?: number; limit?: number; coachId?: string } = {}) {
  const { page = 1, limit = 20, coachId } = params;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<SeatsResponse>({
    queryKey: ["admin", "seats", page, limit, coachId],
    queryFn: async () => {
      const { data } = await apiClient.get<SeatsResponse>(API_ENDPOINTS.ADMIN.SEATS, {
        params: { page, limit, coachId },
      });
      return data;
    },
  });

  const { mutateAsync: createSeat, isPending: isCreating } = useMutation({
    mutationFn: async (seatData: any) => {
      const { data } = await apiClient.post(API_ENDPOINTS.ADMIN.SEATS, seatData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "seats"] });
      toast({ title: "Success", description: "Seat created successfully" });
    },
  });

  const { mutateAsync: bulkCreateSeats, isPending: isBulkCreating } = useMutation({
    mutationFn: async (bulkData: any) => {
        // Backend endpoint expects POST /admin/seats/bulk
        const { data } = await apiClient.post(`${API_ENDPOINTS.ADMIN.SEATS}/bulk`, bulkData);
        return data; 
    },
    onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["admin", "seats"] });
        toast({ title: "Success", description: `Bulk seats created successfully` });
    }
  });

  const { mutateAsync: updateSeat, isPending: isUpdating } = useMutation({
    mutationFn: async ({ id, ...updateData }: any & { id: string }) => {
      const { data } = await apiClient.put(`${API_ENDPOINTS.ADMIN.SEATS}/${id}`, updateData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "seats"] });
      toast({ title: "Success", description: "Seat updated successfully" });
    },
  });

  const { mutateAsync: deleteSeat, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`${API_ENDPOINTS.ADMIN.SEATS}/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "seats"] });
      toast({ title: "Success", description: "Seat deleted successfully" });
    },
  });

  return {
    seats: data?.seats ?? [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
    createSeat,
    isCreating,
    bulkCreateSeats,
    isBulkCreating,
    updateSeat,
    isUpdating,
    deleteSeat,
    isDeleting,
  };
}
