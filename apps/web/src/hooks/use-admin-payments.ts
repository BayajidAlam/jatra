import { useQuery } from "@tanstack/react-query";
import axiosClient from "@/lib/axios-client";
import { API_ENDPOINTS } from "@/lib/constants";

export interface AdminPayment {
    id: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    status: string;
    transactionId: string | null;
    createdAt: string;
    booking: {
        id: string;
        user: {
            name: string;
            email: string;
            phone: string;
        };
    };
}

export interface AdminPaymentsResponse {
    payments: AdminPayment[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const useAdminPayments = (
  page: number = 1,
  limit: number = 10,
  search?: string,
  status: string = "all"
) => {
  return useQuery({
    queryKey: ["admin-payments", page, limit, search, status],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) params.append("search", search);
      if (status && status !== "all") params.append("status", status);

      const response = await axiosClient.get<AdminPaymentsResponse>(
        `${API_ENDPOINTS.ADMIN.PAYMENTS}?${params.toString()}`
      );
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });
};

export interface PaymentStats {
  successfulAmount: number;
  successfulGrowth: string;
  pendingAmount: number;
  pendingGrowth: string;
  refundedAmount: number;
  refundedGrowth: string;
  failedCount: number;
  failedGrowth: string;
}

export const useAdminPaymentStats = () => {
    return useQuery({
        queryKey: ["admin-payment-stats"],
        queryFn: async () => {
            const response = await axiosClient.get<PaymentStats>(`${API_ENDPOINTS.ADMIN.PAYMENTS}/stats`);
            return response.data;
        },
        refetchInterval: 30000,
    });
};
