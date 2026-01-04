"use client";

import { useState } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Train, CreditCard, Ticket, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Mock notifications
const mockNotifications = [
  {
    id: "1",
    type: "BOOKING",
    title: "Booking Confirmed",
    message: "Your booking for Suborno Express (Dhaka - Ctg) is confirmed.",
    time: "2 hours ago",
    read: false,
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    id: "2",
    type: "PAYMENT",
    title: "Payment Successful",
    message: "Payment of BDT 1950 received via bKash.",
    time: "2 hours ago",
    read: false,
    icon: CreditCard,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    id: "3",
    type: "TRAIN",
    title: "Train Schedule Update",
    message: "Suborno Express (701) will depart from Platform 3 today.",
    time: "5 hours ago",
    read: true,
    icon: Train,
    color: "text-orange-600",
    bg: "bg-orange-100",
  },
  {
    id: "4",
    type: "PROMO",
    title: "Special Offer Available",
    message: "Get 10% off on your next journey to Sylhet!",
    time: "1 day ago",
    read: true,
    icon: Ticket,
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
];

export default function NotificationsPage() {
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");
  const [notifications, setNotifications] = useState(mockNotifications);
  const [selectedNotification, setSelectedNotification] = useState<typeof mockNotifications[0] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((n) => ({ ...n, read: true }))
    );
  };

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  const unusedHandleClick = (n: typeof mockNotifications[0]) => {
     markAsRead(n.id);
     setSelectedNotification(n);
     setIsDialogOpen(true);
  }

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "UNREAD") return !n.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-background">


      <div className="container mx-auto px-4 lg:px-8 py-8 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="rounded-full h-6 w-6 p-0 flex items-center justify-center text-xs">
                  {unreadCount}
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground">
              Stay updated with your journeys and offers
            </p>
          </div>
          <div className="flex bg-muted p-1 rounded-lg">
            <button
              onClick={() => setFilter("ALL")}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-all",
                filter === "ALL"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilter("UNREAD")}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-all",
                filter === "UNREAD"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Unread
            </button>
          </div>
        </div>

        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Recent Alerts</CardTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-primary hover:text-primary/80"
              >
                Mark all as read
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {filteredNotifications.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No notifications found</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredNotifications.map((notification) => {
                  const Icon = notification.icon;
                  return (
                    <div
                      key={notification.id}
                      onClick={() => unusedHandleClick(notification)}
                      className={cn(
                        "p-4 flex gap-4 hover:bg-muted/50 transition-colors cursor-pointer",
                        !notification.read && "bg-primary/5"
                      )}
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                          notification.bg,
                          notification.color
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <p
                            className={cn(
                              "font-medium truncate pr-2",
                              !notification.read ? "text-foreground" : "text-muted-foreground"
                            )}
                          >
                            {notification.title}
                          </p>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {notification.time}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification Detail Modal */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-4 mb-2">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                    selectedNotification?.bg,
                    selectedNotification?.color
                  )}
                >
                  {selectedNotification && (
                    <selectedNotification.icon className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <DialogTitle className="text-xl">{selectedNotification?.title}</DialogTitle>
                  <DialogDescription>
                    {selectedNotification?.time}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-foreground/80 leading-relaxed">
                {selectedNotification?.message}
              </p>
              <div className="mt-6 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                <p className="font-mono">ID: {selectedNotification?.id}</p>
                <p>Status: {selectedNotification?.read ? "Read" : "Unread"}</p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsDialogOpen(false)} className="w-full">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
