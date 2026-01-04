import { useQuery } from "@tanstack/react-query";
import axiosClient from "@/lib/axios-client";
import { API_ENDPOINTS } from "@/lib/constants";

export interface DashboardStats {
  overview: {
    totalRevenue: number;
    revenueGrowth: string;
    totalBookings: number;
    bookingGrowth: string;
    activeTrains: number;
    totalUsers: number;
    userGrowth: string;
  };
  charts: {
    revenue: { name: string; total: number }[];
    traffic: { time: string; visitors: number }[];
  };
  recentBookings: {
    id: string;
    bookingId: string;
    passengerName: string;
    trainName: string;
    route: string;
    amount: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
  }[];
}

export const useAdminStats = () => {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const response = await axiosClient.get<DashboardStats>(API_ENDPOINTS.ADMIN.STATS);
      return response.data;
    },
    refetchInterval: 60000, // Refresh every minute
  });
};
