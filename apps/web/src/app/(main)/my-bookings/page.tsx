"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Train,
  Calendar,
  MapPin,
  Search,
  Clock,
  CreditCard,
  ArrowRight,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useBookings } from "@/hooks/use-bookings";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function MyBookingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"UPCOMING" | "PAST" | "CANCELLED">(
    "UPCOMING"
  );
  const [searchQuery, setSearchQuery] = useState("");
  
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { useUserBookings, cancelBooking } = useBookings(user?.id);
  const { data: bookingsData, isLoading: bookingsLoading } = useUserBookings();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/my-bookings");
    }
  }, [authLoading, isAuthenticated, router]);

  const bookings = bookingsData?.data || [];

  const handleCancelBooking = async (bookingId: string) => {
    try {
        await cancelBooking.mutateAsync({
            bookingId,
            reason: "User requested cancellation"
        });
        toast({
            title: "Booking Cancelled",
            description: "Your booking has been cancelled and refund initiated.",
        });
    } catch (error) {
        toast({
            title: "Cancellation Failed",
            description: "Could not cancel booking. It may be too late.",
            variant: "destructive",
        });
    }
  };

  const filteredBookings = bookings.filter((booking: any) => {
    const trainName = booking?.journey?.trainName || "";
    const trainNumber = booking?.journey?.trainNumber || "";
    
    const matchesSearch = trainName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          trainNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (activeTab === "UPCOMING") return booking.status === "CONFIRMED" || booking.status === "PAYMENT_PENDING";
    if (activeTab === "PAST") return booking.status === "COMPLETED"; // Or date check if 'COMPLETED' isn't used for past
    if (activeTab === "CANCELLED") return booking.status === "CANCELLED";
    return true;
  });

  if (authLoading || bookingsLoading) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">


      <div className="container mx-auto px-4 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground">
            View and manage your train bookings
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-border overflow-x-auto">
          {[
            { id: "UPCOMING", label: "Upcoming" },
            { id: "PAST", label: "Past" },
            { id: "CANCELLED", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(tab.id as "UPCOMING" | "PAST" | "CANCELLED")
              }
              className={cn(
                "px-4 py-3 font-medium text-sm transition-all whitespace-nowrap border-b-2",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by train name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <Card className="border-border bg-card/60 backdrop-blur-md shadow-lg p-0">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Train className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
              <p className="text-muted-foreground mb-6">
                You don&apos;t have any {activeTab.toLowerCase()} bookings yet.
              </p>
              <Link href="/search-trains">
                <Button className="bg-primary hover:bg-primary/90">
                  Search Trains
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking: any) => (
              <Card
                key={booking.id}
                className="border-border bg-card/40 backdrop-blur-sm hover:bg-card/60 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <CardContent className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Train className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">
                              {booking.journey.train.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {booking.journey.train.trainNumber}
                            </p>
                          </div>
                        </div>

                        <div
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium",
                            booking.status === "CONFIRMED" &&
                              "bg-green-500/10 text-green-700 dark:text-green-400",
                            booking.status === "COMPLETED" &&
                              "bg-blue-500/10 text-blue-700 dark:text-blue-400",
                            booking.status === "CANCELLED" &&
                              "bg-red-500/10 text-red-700 dark:text-red-400",
                            booking.status === "PAYMENT_PENDING" &&
                              "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                          )}
                        >
                          {booking.status}
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {booking.reservation?.fromStation?.name || "Start"} → {booking.reservation?.toStation?.name || "End"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(booking.journey.departureTime), "MMM dd, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>
                            {format(new Date(booking.journey.departureTime), "HH:mm")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <CreditCard className="h-4 w-4" />
                          <span className="font-medium text-foreground">
                            BDT {booking.totalAmount}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                       <Link
                         href={`/my-bookings/${booking.id}`}
                         className="block"
                       >
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-2 bg-transparent w-full"
                        >
                          View Details
                        </Button>
                      </Link>
                      
                      {(booking.status === 'CONFIRMED' || booking.status === 'PAYMENT_PENDING') && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                variant="outline"
                                size="sm"
                                className="border-2 text-red-600 hover:text-red-700 bg-transparent"
                                >
                                Cancel Booking
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will cancel your booking and initiate a refund if applicable.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleCancelBooking(booking.id)} className="bg-red-600 hover:bg-red-700">Continue</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
