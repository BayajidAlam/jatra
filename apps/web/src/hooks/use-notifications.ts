"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "@/lib/axios-client";
import { useAuthStore } from "@/stores/auth-store";

export interface Notification {
  id: string;
  type: "BOOKING_CONFIRMED" | "BOOKING_CANCELLED" | "PAYMENT_SUCCESS" | "PAYMENT_FAILED" | "TRAIN_UPDATE" | "PROMO";
  subject: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
}

export interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
}

const fetchNotifications = async (userId: string | undefined) => {
  if (!userId) return { notifications: [], unreadCount: 0 };
  const { data } = await axiosClient.get<NotificationResponse>(`/notifications/user/${userId}`);
  return data;
};

export function useNotifications() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () => fetchNotifications(user?.id),
    enabled: !!user?.id,
    refetchInterval: 30000, // Poll every 30 seconds
    refetchOnWindowFocus: true,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await axiosClient.patch(`/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      await axiosClient.patch(`/notifications/user/${user.id}/read-all`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
  });

  return {
    notifications: query.data?.notifications || [],
    unreadCount: query.data?.unreadCount || 0,
    isLoading: query.isLoading,
    isError: query.isError,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
  };
}
