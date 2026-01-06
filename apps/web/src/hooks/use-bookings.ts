import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axios-client";
import { API_ENDPOINTS } from "@/lib/constants";

export interface Booking {
  id: string;
  status: "PAYMENT_PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  totalAmount: number;
  journey: {
    trainName: string;
    trainNumber: string;
    departureTime: string;
    arrivalTime: string;
    route: {
      stops: any[]; // simplified
    };
  };
  seats: {
    seat: {
      seatNumber: string;
      coach: {
        coachCode: string;
      }
    }
  }[];
  reservation: {
    fromStation: { name: string };
    toStation: { name: string };
  };
  // Add other fields as needed
}

export const useBookings = (userId?: string) => {
  const queryClient = useQueryClient();

  const fetchUserBookings = async () => {
    if (!userId) return { data: [], pagination: {} };
    const { data } = await apiClient.get(
      `${API_ENDPOINTS.BOOKING.MY_BOOKINGS}/user/${userId}`
    );
    return data;
  };

  const useUserBookings = (enabled: boolean = true) =>
    useQuery({
      queryKey: ["bookings", userId],
      queryFn: fetchUserBookings,
      enabled: !!userId && enabled,
    });

  const cancelBookingMutation = useMutation({
    mutationFn: async ({
      bookingId,
      reason,
    }: {
      bookingId: string;
      reason: string;
    }) => {
      const { data } = await apiClient.post(
        `${API_ENDPOINTS.BOOKING.MY_BOOKINGS}/${bookingId}/cancel`,
        { reason }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", userId] });
    },
  });

  return {
    useUserBookings,
    cancelBooking: cancelBookingMutation,
  };
};
