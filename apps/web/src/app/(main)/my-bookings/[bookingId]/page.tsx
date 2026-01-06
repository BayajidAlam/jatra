"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import axios from "axios";
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
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function BookingDetailsPage() {
  const params = useParams();
  const bookingId = params.bookingId as string;
  const [isLoading, setIsLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);
  const [expandedTickets, setExpandedTickets] = useState<string[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1"}/bookings/${bookingId}`
        );
        setBooking(response.data);
      } catch (err) {
        console.error("Failed to fetch booking details:", err);
        setError("Failed to load booking details");
      } finally {
        setIsLoading(false);
      }
    };

    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  const toggleTicket = (ticketId: string) => {
    setExpandedTickets((prev) =>
      prev.includes(ticketId)
        ? prev.filter((id) => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const handleDownloadPDF = async () => {
    if (!booking) return;
    const { downloadTicketPDF } = await import("@/lib/download-ticket");
    await downloadTicketPDF(booking.id, booking.status);
  };

  const handleEmailTickets = () => {
    alert(`Emailing tickets to ${booking.customerEmail || "registered email"}`);
  };

  const handleShareBooking = () => {
    if (navigator.share) {
      navigator.share({
        title: `Jatra Railway Booking ${booking.id}`,
        text: `Check out my train booking`,
      });
    }
  };

  const handleCancelBooking = async () => {
     if (confirm("Are you sure you want to cancel this booking?")) {
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1"}/bookings/${bookingId}/cancel`, {
                reason: "User requested cancellation"
            });
            alert("Booking cancelled successfully");
            window.location.reload();
        } catch (error) {
            alert("Failed to cancel booking");
        }
     }
  };

  // Format dates
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
      if (!dateString) return "";
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !booking) {
      return (
          <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center gap-4">
              <h1 className="text-xl font-bold text-red-600">Error Loading Booking</h1>
              <p>{error || "Booking not found"}</p>
              <Link href="/my-bookings"><Button>Go Back</Button></Link>
          </div>
      )
  }

  // Derive display values from real data
  const trainName = booking.journey?.train?.name || "Train";
  const trainNumber = booking.journey?.train?.trainNumber || "";
  const fromStation = booking.reservation?.fromStation?.name || booking.journey?.route?.stops?.[0]?.fromStation?.name || "Start";
  const toStation = booking.reservation?.toStation?.name || booking.journey?.route?.stops?.[booking.journey?.route?.stops?.length - 1]?.toStation?.name || "End";
  const departureTime = booking.journey?.departureTime;
  const arrivalTime = booking.journey?.arrivalTime; // Check if this exists in model, else calculate
  // Prioritize actual passenger data if available
  const passengers = (booking.passengers && booking.passengers.length > 0)
    ? booking.passengers.map((p: any) => ({
        passengerId: p.id,
        name: p.passengerName || p.name || "Passenger",
        seat: `${p.seatNumber} (${p.coachId ? 'Coach ' + p.coachId : 'Seat'})`,
        fare: p.fare || (booking.totalAmount / booking.passengers.length),
        ticketId: booking.ticket?.ticketNumber || "Pending"
      }))
    : booking.seats?.map((s: any, idx: number) => ({
        passengerId: s.id,
        name: idx === 0 ? (booking.customerName || booking.user?.name || "Passenger") : "Passenger",
        seat: `${s.seat?.seatNumber} (${s.seat?.coach?.coachCode || 'Seat'})`,
        fare: s.seat?.baseFare || (booking.totalAmount / booking.seats.length),
        ticketId: booking.ticket?.ticketNumber || "Pending"
    })) || [];

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
                {booking.id}
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
                  {formatTime(departureTime)}
                </p>
                <p className="font-semibold text-base mb-2">
                  {fromStation}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(departureTime)}
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="h-px w-12 bg-border mb-3 sm:w-20" />
                <Train className="h-5 w-5 text-muted-foreground mb-3" />
                <div className="h-px w-12 bg-border sm:w-20" />
                <p className="text-xs text-muted-foreground text-center mt-2">
                  {trainNumber}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-2">Arrival (Est)</p>
                <p className="text-3xl font-bold mb-1">
                  {arrivalTime ? formatTime(arrivalTime) : "--:--"}
                </p>
                <p className="font-semibold text-base mb-2">
                  {toStation}
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
                    {trainName}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Train {trainNumber}
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Contact Details */}
        {booking.user && (
          <Card className="mb-6 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                Contact Details
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Name</p>
                  <p className="font-medium">{booking.user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Email</p>
                  <p className="font-medium">{booking.user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Phone</p>
                  <p className="font-medium">{booking.user.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Passengers Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            Passengers ({passengers.length})
          </h2>
          <div className="space-y-3">
            {passengers.map((passenger: any) => (
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
                        <span className="text-xs text-muted-foreground font-mono">
                          TKT: {passenger.ticketId}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="font-mono mb-1">
                        {passenger.seat}
                      </Badge>
                      <p className="text-sm font-semibold">৳{passenger.fare}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
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
                  Fare × {passengers.length} passengers
                </span>
                <span className="font-medium">৳{booking.totalAmount}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-baseline">
                <span className="font-semibold">Total Paid</span>
                <span className="text-2xl font-bold">
                  ৳{booking.totalAmount}
                </span>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                {booking.payment && (
                    <>
                    <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment method</span>
                    <Badge variant="outline">{booking.payment.paymentMethod || "N/A"}</Badge>
                    </div>
                    <div className="flex justify-between">
                    <span className="text-muted-foreground">Transaction ID</span>
                    <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                        {booking.payment.transactionId || "N/A"}
                    </code>
                    </div>
                    </>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status}
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
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
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

        {/* Payment Action Button */}
        {booking.status === 'PAYMENT_PENDING' && (
             <Link href={`/booking/payment?bookingId=${booking.id}&amount=${booking.totalAmount}&seatIds=${booking.seats?.map((s:any)=>s.seatId).join(',')}&seatNumbers=${booking.seats?.map((s:any)=>s.seat?.seatNumber).join(',')}`} className="w-full mb-3 block">
               <Button className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay Now (৳{booking.totalAmount})
               </Button>
             </Link>
        )}

        {/* Cancel Booking Button */}
        {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
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
