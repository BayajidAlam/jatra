"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Mail,
  Share2,
  Train,
  User,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Mock booking data matching backend contract
const mockBookingData = {
  bookingId: "BK20251231001",
  status: "CONFIRMED",
  createdAt: "2025-12-31T10:30:00Z",
  train: { id: "train_701", name: "Suborno Express", number: "701" },
  route: { from: "Dhaka", to: "Chittagong", distanceKm: 232 },
  schedule: {
    departureAt: "2025-01-15T10:00:00Z",
    arrivalAt: "2025-01-15T14:30:00Z",
    platform: "3",
  },
  passengers: [
    {
      passengerId: "p1",
      name: "John Doe",
      seat: "A3",
      fare: 650,
      ticketId: "TKT1",
    },
    {
      passengerId: "p2",
      name: "Jane Smith",
      seat: "A4",
      fare: 650,
      ticketId: "TKT2",
    },
  ],
  tickets: [
    {
      ticketId: "TKT1",
      qr: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23ffffff' width='100' height='100'/%3E%3C/svg%3E",
      qrType: "BASE64",
      status: "ACTIVE",
    },
  ],
  payment: {
    method: "BKASH",
    amount: 1950,
    transactionId: "TXN1",
    status: "COMPLETED",
    paidAt: "2025-12-31T10:35:00Z",
  },
  cancellation: {
    canCancel: true,
    deadlineAt: "2025-01-15T08:00:00Z",
    feeAmount: 390,
  },
  contact: { phone: "+8801700000000", email: "user@example.com" },
};

export default function BookingDetailsPage() {
  const params = useParams();
  const bookingId = params.bookingId as string;
  const [isLoading, setIsLoading] = useState(false);
  const [expandedTickets, setExpandedTickets] = useState<string[]>([]);

  // In real app, fetch booking data based on bookingId
  const booking = mockBookingData;

  const toggleTicket = (ticketId: string) => {
    setExpandedTickets((prev) =>
      prev.includes(ticketId)
        ? prev.filter((id) => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const handleDownloadPDF = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  };

  const handleEmailTickets = () => {
    console.log("[v0] Sending tickets via email to:", booking.contact.email);
  };

  const handleShareBooking = () => {
    if (navigator.share) {
      navigator.share({
        title: `Jatra Railway Booking ${booking.bookingId}`,
        text: `Check out my train booking`,
      });
    }
  };

  const handleCancelBooking = () => {
    console.log("[v0] Initiating cancellation for booking:", bookingId);
  };

  // Format dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "COMPLETED":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      case "CANCELLED":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const isCancellationDeadlinePassed =
    new Date(booking.cancellation.deadlineAt) < new Date();

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 lg:px-8 py-4 max-w-4xl">
          <div className="flex items-center gap-4">
            <Link href="/my-bookings">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Booking Details</h1>
              <p className="text-sm text-muted-foreground">
                {booking.bookingId}
              </p>
            </div>
            <Badge className={getStatusColor(booking.status)}>
              {booking.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-6 max-w-4xl">
        {/* Journey Card */}
        <Card className="mb-6 shadow-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-center">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Departure</p>
                <p className="text-3xl font-bold mb-1">
                  {formatTime(booking.schedule.departureAt)}
                </p>
                <p className="font-semibold text-base mb-2">
                  {booking.route.from}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(booking.schedule.departureAt)}
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="h-px w-12 bg-border mb-3 sm:w-20" />
                <Train className="h-5 w-5 text-muted-foreground mb-3" />
                <div className="h-px w-12 bg-border sm:w-20" />
                <p className="text-xs text-muted-foreground text-center mt-2">
                  {booking.train.number}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-2">Arrival</p>
                <p className="text-3xl font-bold mb-1">
                  {formatTime(booking.schedule.arrivalAt)}
                </p>
                <p className="font-semibold text-base mb-2">
                  {booking.route.to}
                </p>
                <p className="text-sm text-muted-foreground">
                  {booking.route.distanceKm} km
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Train Info Card */}
        <Card className="mb-6 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Train className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">
                    {booking.train.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Train {booking.train.number}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Platform</p>
                <p className="text-lg font-bold">{booking.schedule.platform}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Passengers Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            Passengers ({booking.passengers.length})
          </h2>
          <div className="space-y-3">
            {booking.passengers.map((passenger) => (
              <Card key={passenger.passengerId} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          {passenger.name}
                        </p>
                        <Link
                          href={`/ticket/${passenger.ticketId}`}
                          className="text-xs text-muted-foreground font-mono hover:underline"
                        >
                          {passenger.ticketId}
                        </Link>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="font-mono mb-1">
                        Seat {passenger.seat}
                      </Badge>
                      <p className="text-sm font-semibold">৳{passenger.fare}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Tickets Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            Digital Tickets
          </h2>
          <div className="space-y-3">
            {booking.tickets.map((ticket) => (
              <Card key={ticket.ticketId} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          {ticket.ticketId}
                        </p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {ticket.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/ticket/${ticket.ticketId}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-transparent border-2"
                        >
                          View Ticket
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleTicket(ticket.ticketId)}
                        className="text-primary"
                      >
                        {expandedTickets.includes(ticket.ticketId)
                          ? "Hide"
                          : "View"}{" "}
                        QR
                      </Button>
                    </div>
                  </div>
                  {expandedTickets.includes(ticket.ticketId) && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-3">
                        This QR code will be included in your PDF ticket
                      </p>
                      <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
                        <img src={ticket.qr} alt="QR" className="w-28 h-28" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Cancellation Info */}
        {booking.cancellation.canCancel && !isCancellationDeadlinePassed && (
          <Card className="mb-6 border-orange-200 bg-orange-50/50 shadow-sm">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-sm text-orange-900 mb-1">
                    Cancellation Available
                  </p>
                  <p className="text-sm text-orange-800 mb-2">
                    You can cancel this booking until{" "}
                    {formatDate(booking.cancellation.deadlineAt)} at{" "}
                    {formatTime(booking.cancellation.deadlineAt)}
                  </p>
                  <p className="text-xs text-orange-700">
                    Cancellation fee: ৳{booking.cancellation.feeAmount} (
                    {Math.round(
                      (booking.cancellation.feeAmount /
                        booking.payment.amount) *
                        100
                    )}
                    %)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isCancellationDeadlinePassed && booking.cancellation.canCancel && (
          <Card className="mb-6 border-red-200 bg-red-50/50 shadow-sm">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-sm text-red-900">
                    Cancellation Deadline Passed
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    You can no longer cancel this booking. Please contact
                    support if you need assistance.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Summary */}
        <Card className="mb-6 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              Payment Summary
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Fare × {booking.passengers.length} passengers
                </span>
                <span className="font-medium">৳{booking.payment.amount}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-baseline">
                <span className="font-semibold">Total Paid</span>
                <span className="text-2xl font-bold">
                  ৳{booking.payment.amount}
                </span>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment method</span>
                  <Badge variant="outline">{booking.payment.method}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                    {booking.payment.transactionId}
                  </code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {booking.payment.status}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid sm:grid-cols-3 gap-3 mb-6">
          <Button
            onClick={handleDownloadPDF}
            disabled={isLoading}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            {isLoading ? "Preparing..." : "Download PDF"}
          </Button>
          <Button
            onClick={handleEmailTickets}
            variant="outline"
            className="w-full bg-transparent"
          >
            <Mail className="h-4 w-4 mr-2" />
            Email Tickets
          </Button>
          <Button
            onClick={handleShareBooking}
            variant="outline"
            className="w-full bg-transparent"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>

        {/* Cancel Booking Button */}
        {booking.cancellation.canCancel && !isCancellationDeadlinePassed && (
          <Button
            onClick={handleCancelBooking}
            variant="outline"
            className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 bg-transparent"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Cancel Booking
          </Button>
        )}
      </div>
    </div>
  );
}
