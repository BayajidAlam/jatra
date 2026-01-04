"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import apiClient from "@/lib/axios-client";
import { API_ENDPOINTS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

export interface AdminBooking {
    id: string;
    bookingDate: string;
    status: string;
    totalAmount: number;
    user: {
        id: string;
        name: string;
        email: string;
        phone: string;
    };
    journey: {
        id: string;
        journeyDate: string;
        departureTime: string;
        arrivalTime: string;
        train: {
            name: string;
            trainNumber: string;
        };
        route: {
            routeName: string;
        };
    };
    payments: any[]; // Define more specifically if needed
    // Assuming tickets might be nested or fetched separately, but for list view these are key
    tickets?: {
        id: string;
        seatNumber: string;
        coachId: string; // Could be expanded to show Coach name
        status: string;
    }[];
}

interface BookingsResponse {
  bookings: AdminBooking[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function useAdminBookings(params?: { page?: number; limit?: number; search?: string }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const search = params?.search || "";

  const bookingsQuery = useQuery<BookingsResponse>({
    queryKey: ["admin", "bookings", page, limit, search],
    queryFn: async () => {
      const { data } = await apiClient.get<BookingsResponse>(
        API_ENDPOINTS.ADMIN.BOOKINGS,
        { params: { page, limit, search } }
      );
      return data;
    },
    placeholderData: keepPreviousData,
  });

  const { mutateAsync: updateBookingStatus, isPending: isUpdating } = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await apiClient.patch(`${API_ENDPOINTS.ADMIN.BOOKINGS}/${id}/status`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
      toast({ title: "Success", description: "Booking status updated successfully" });
    },
    onError: (error: any) => {
       toast({ 
           title: "Error", 
           description: error?.response?.data?.message || "Failed to update booking status",
           variant: "destructive"
       });
    }
  });

  return {
    bookings: bookingsQuery.data?.bookings ?? [],
    pagination: bookingsQuery.data?.pagination,
    isLoading: bookingsQuery.isLoading,
    error: bookingsQuery.error,
    refetch: bookingsQuery.refetch,
    updateBookingStatus,
    isUpdating,
  };
}
