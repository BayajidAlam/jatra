"use client";

import { useState } from "react";
import { useNotifications, Notification } from "@/hooks/use-notifications"; // Import hook
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Train, CreditCard, Ticket, CheckCircle2, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Helper to map notification types to icons and colors
const getNotificationStyle = (type: string) => {
  switch (type) {
    case "BOOKING_CONFIRMED":
      return { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" };
    case "PAYMENT_SUCCESS":
      return { icon: CreditCard, color: "text-blue-600", bg: "bg-blue-100" };
    case "TRAIN_UPDATE":
      return { icon: Train, color: "text-orange-600", bg: "bg-orange-100" };
    case "PROMO":
      return { icon: Ticket, color: "text-purple-600", bg: "bg-purple-100" };
    case "PAYMENT_FAILED":
    case "BOOKING_CANCELLED":
      return { icon: Info, color: "text-red-600", bg: "bg-red-100" };
    default:
      return { icon: Bell, color: "text-slate-600", bg: "bg-slate-100" };
  }
};

export default function NotificationsPage() {
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications();
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleNotificationClick = (n: Notification) => {
     if (!n.isRead) {
         markAsRead(n.id);
     }
     setSelectedNotification(n);
     setIsDialogOpen(true);
  }

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "UNREAD") return !n.isRead;
    return true;
  });

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
                onClick={() => markAllAsRead()}
                className="text-primary hover:text-primary/80"
              >
                Mark all as read
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
                <div className="p-12 text-center text-muted-foreground">
                    <p>Loading notifications...</p>
                </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No notifications found</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredNotifications.map((notification) => {
                  const style = getNotificationStyle(notification.type);
                  const Icon = style.icon;
                  return (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        "p-4 flex gap-4 hover:bg-muted/50 transition-colors cursor-pointer",
                        !notification.isRead && "bg-primary/5"
                      )}
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                          style.bg,
                          style.color
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <p
                            className={cn(
                              "font-medium truncate pr-2",
                              !notification.isRead ? "text-foreground" : "text-muted-foreground"
                            )}
                          >
                            {notification.subject}
                          </p>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {notification.content}
                        </p>
                      </div>
                      {!notification.isRead && (
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
                        {selectedNotification && (
                            <>
                            <div className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                                getNotificationStyle(selectedNotification.type).bg,
                                getNotificationStyle(selectedNotification.type).color
                            )}>
                                {(() => {
                                    const Icon = getNotificationStyle(selectedNotification.type).icon;
                                    return <Icon className="w-6 h-6" />;
                                })()}
                            </div>
                            <div>
                                <DialogTitle className="text-xl">{selectedNotification.subject}</DialogTitle>
                                <DialogDescription>
                                    {new Date(selectedNotification.createdAt).toLocaleString()}
                                </DialogDescription>
                            </div>
                            </>
                        )}
                    </div>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm text-foreground/80 leading-relaxed">
                        {selectedNotification?.content}
                    </p>
                    <div className="mt-6 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                        <p className="font-mono">ID: {selectedNotification?.id}</p>
                        <p>Type: {selectedNotification?.type}</p>
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

