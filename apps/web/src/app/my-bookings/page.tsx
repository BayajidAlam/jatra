"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Train,
  Calendar,
  MapPin,
  Search,
  Clock,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Mock data
const mockBookings = [
  {
    id: "BK001",
    trainNumber: "SUBORNO-EXPRESS-701",
    trainName: "Suborno Express",
    journeyDate: "2025-01-15",
    departureTime: "06:30",
    arrivalTime: "12:45",
    fromStation: "Dhaka",
    toStation: "Chittagong",
    status: "CONFIRMED",
    totalAmount: 1300,
    passengersCount: 2,
    bookingDate: "2025-01-10",
    canCancel: true,
  },
  {
    id: "BK002",
    trainNumber: "TURNA-NISHITHA-727",
    trainName: "Turna Nishitha",
    journeyDate: "2025-01-08",
    departureTime: "08:00",
    arrivalTime: "14:20",
    fromStation: "Dhaka",
    toStation: "Sylhet",
    status: "COMPLETED",
    totalAmount: 1100,
    passengersCount: 1,
    bookingDate: "2025-01-05",
    canCancel: false,
  },
  {
    id: "BK003",
    trainNumber: "MOHANAGAR-711",
    trainName: "Mohanagar Godhuli",
    journeyDate: "2024-12-28",
    departureTime: "15:30",
    arrivalTime: "21:45",
    fromStation: "Dhaka",
    toStation: "Chittagong",
    status: "CANCELLED",
    totalAmount: 900,
    passengersCount: 1,
    bookingDate: "2024-12-25",
    canCancel: false,
  },
];

export default function MyBookingsPage() {
  const [activeTab, setActiveTab] = useState<"UPCOMING" | "PAST" | "CANCELLED">(
    "UPCOMING"
  );
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBookings = mockBookings.filter((booking) => {
    if (activeTab === "UPCOMING") return booking.status === "CONFIRMED";
    if (activeTab === "PAST") return booking.status === "COMPLETED";
    if (activeTab === "CANCELLED") return booking.status === "CANCELLED";
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

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
              placeholder="Search by train name or PNR..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <Card className="border-2">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
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
            {filteredBookings.map((booking) => (
              <Card
                key={booking.id}
                className="border-2 hover:border-primary/50 transition-all"
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
                              {booking.trainName}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {booking.trainNumber}
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
                              "bg-red-500/10 text-red-700 dark:text-red-400"
                          )}
                        >
                          {booking.status}
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {booking.fromStation} → {booking.toStation}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{booking.journeyDate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>
                            {booking.departureTime} - {booking.arrivalTime}
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
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-2 bg-transparent"
                      >
                        View Details
                      </Button>
                      {booking.canCancel && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-2 text-red-600 hover:text-red-700 bg-transparent"
                        >
                          Cancel Booking
                        </Button>
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
