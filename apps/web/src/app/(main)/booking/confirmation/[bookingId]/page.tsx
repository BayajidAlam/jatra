"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/axios-client";
import { API_ENDPOINTS } from "@/lib/constants";
import { toast } from "sonner";
import {
  CheckCircle2,
  Download,
  Mail,
  Share2,
  Train,
  Calendar,
  Clock,
  MapPin,
  User,
  CreditCard,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Define interfaces for API response
interface Station {
  id: string;
  name: string;
  code: string;
}

interface Seat {
  id: string;
  seatNumber: string;
  coachId: string;
  coach: {
    coachCode: string;
    coachType: string;
  };
}

interface BookingSeat {
  seat: Seat;
}

interface BookingPassenger {
  id: string;
  passengerName: string;
  passengerAge: number | string;
  passengerGender: string;
  seatNumber?: string;
  fare?: number;
}

interface BookingResponse {
  id: string;
  status: string;
  totalAmount: number;
  reservation: {
    lockId: string; // Used as Booking ID display
    fromStation: Station;
    toStation: Station;
  };
  journey: {
    departureTime: string;
    arrivalTime: string;
    train: {
      name: string;
      trainNumber: string;
      totalSeats: number;
    };
    route: {
      distance?: number;
      // Derived duration if not present
    };
  };
  payment?: {
    status: string;
    amount: number;
    paymentMethod: string;
    transactionId: string;
  };
  seats: BookingSeat[];
  passengers?: BookingPassenger[];
  ticket?: {
    ticketNumber: string;
    pdfUrl?: string; // Generated on demand usually
  };
  createdAt: string;
}

import { downloadTicketPDF } from "@/lib/download-ticket";

export default function BookingConfirmationPage() {
  const params = useParams();
  const bookingId = params.bookingId as string;
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  const { data: booking, isLoading, error } = useQuery<BookingResponse>({
    queryKey: ["booking", bookingId],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.BOOKING.DETAILS(bookingId));
      return response.data;
    },
    enabled: !!bookingId,
  });

  const handleDownloadTickets = async () => {
    if (!booking) return;
    await downloadTicketPDF(bookingId, booking.status);
  };

  const handleEmailTickets = async () => {
    if (!booking) return;
    
    try {
      setIsEmailLoading(true);
      
      // Get ticket ID first
      const ticketResponse = await apiClient.get(`/tickets/booking/${bookingId}`);
      
      if (ticketResponse.data) {
        const ticketData = ticketResponse.data;
        
        if (ticketData && ticketData.id) {
          // Send email request
          const emailResponse = await apiClient.post(`/tickets/${ticketData.id}/email`);
          
          if (emailResponse.data) {
            toast.success("Ticket sent to your email successfully!");
          }
        } else {
          toast.error("Ticket not found. Please ensure your booking is confirmed.");
        }
      } else {
        toast.error("Ticket not found. Please ensure your booking is confirmed.");
      }
    } catch (error: any) {
      console.error("Failed to email ticket:", error);
      toast.error("Failed to send email. Please try again.");
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleShareBooking = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Jatra Railway Ticket',
        text: `Check out my trip to ${booking?.reservation.toStation.name}!`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-sm">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Booking Not Found</h2>
            <p className="text-muted-foreground mb-6">
                We couldn't retrieve the booking details. Please check the ID or try again.
            </p>
            <Link href="/my-bookings">
                <Button>Go to My Bookings</Button>
            </Link>
        </div>
      </div>
    );
  }

  // Derive duration/dates from journey times
  const departureDate = new Date(booking.journey.departureTime);
  const arrivalDate = new Date(booking.journey.arrivalTime);
  
  const formattedDate = departureDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  const formattedTime = departureDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const formattedArrivalTime = arrivalDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  // Calculate duration
  const diffMs = arrivalDate.getTime() - departureDate.getTime();
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffMins = Math.round(((diffMs % 3600000) / 60000));
  const duration = `${diffHrs}h ${diffMins}m`;

  // Use actual passengers if available, otherwise create fallback from seats
  const displayPassengers = booking.passengers && booking.passengers.length > 0 
    ? booking.passengers 
    : booking.seats.map((s, i) => ({
        id: s.seat.id,
        passengerName: `Passenger ${i + 1}`,
        passengerAge: "-",
        passengerGender: "N/A",
        seatNumber: s.seat.seatNumber,
        fare: 650 // Assuming base fare if not present
      }));

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="bg-linear-to-r from-green-600 to-green-700 text-white">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">Booking Confirmed!</h1>
              <p className="text-green-50 text-sm mb-3">
                Your tickets have been sent to your email
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-green-100">Booking ID:</span>
                <code className="px-2 py-1 bg-white/10 rounded text-sm font-mono">
                  {booking.reservation.lockId || booking.id.slice(0, 8).toUpperCase()}
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Card className="mb-6 shadow-sm hidden xl:block">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleDownloadTickets}
                className="flex-1 sm:flex-none"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button
                onClick={handleEmailTickets}
                variant="outline"
                className="flex-1 sm:flex-none bg-transparent"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button
                onClick={handleShareBooking}
                variant="outline"
                className="flex-1 sm:flex-none bg-transparent"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Train className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {booking.journey.train.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Train {booking.journey.train.trainNumber} · Intercity
                    </p>
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-center">
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm font-medium">Departure</span>
                    </div>
                    <p className="text-3xl font-bold mb-1">
                      {formattedTime}
                    </p>
                    <p className="font-semibold text-lg mb-1">
                      {booking.reservation.fromStation.name}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formattedDate}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center px-4">
                    <div className="w-full h-px bg-border mb-2" />
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-muted rounded-full">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium">
                        {duration}
                      </span>
                    </div>
                    <div className="w-full h-px bg-border mt-2" />
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2 justify-end">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm font-medium">Arrival</span>
                    </div>
                    <p className="text-3xl font-bold mb-1">
                      {formattedArrivalTime}
                    </p>
                    <p className="font-semibold text-lg mb-1">
                      {booking.reservation.toStation.name}
                    </p>
                    {booking.journey.route.distance && (
                        <p className="text-sm text-muted-foreground">
                        {booking.journey.route.distance} km
                        </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  Passenger Details
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="p-0">
                <div className="divide-y">
                  {displayPassengers.map((passenger, index) => (
                    <div
                      key={index}
                      className="p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold">{passenger.passengerName}</p>
                            <p className="text-sm text-muted-foreground">
                              {passenger.passengerAge} yrs ·{" "}
                              {passenger.passengerGender !== "N/A" && passenger.passengerGender ? passenger.passengerGender.charAt(0) +
                                passenger.passengerGender.slice(1).toLowerCase() : ""}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="font-mono">
                            Seat {passenger.seatNumber || (booking.seats[index]?.seat?.seatNumber)}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            ৳{passenger.fare || 650}
                          </p>
                        </div>
                      </div>
                      {/* <div className="pl-12">
                        <p className="text-xs text-muted-foreground font-mono">
                          Ticket ID: {booking.ticket?.ticketNumber}
                        </p>
                      </div> */}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-blue-900">
                  Important Travel Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2 text-sm text-blue-900/80">
                  <li className="flex gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Arrive at least 30 minutes before departure</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Bring a valid photo ID for verification</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Present your booking confirmation at the gate</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      Cancellations allowed up to 2 hours before departure (20%
                      fee)
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-sm sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Tickets × {displayPassengers.length}
                    </span>
                    <span className="font-medium">
                      ৳{booking.totalAmount}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Booking fee</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold">Total Paid</span>
                    <span className="text-2xl font-bold">
                      ৳{booking.totalAmount}
                    </span>
                  </div>

                  <Separator />

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Payment method
                      </span>
                      <Badge variant="outline">{booking.payment?.paymentMethod || 'N/A'}</Badge>
                    </div>
                    {booking.payment?.transactionId && (
                        <div className="flex justify-between">
                        <span className="text-muted-foreground">
                            Transaction ID
                        </span>
                        <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                            {booking.payment.transactionId}
                        </code>
                        </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Payment status
                      </span>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {booking.payment?.status || booking.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm hidden xl:block">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 text-sm">Quick Actions</h3>
                <div className="space-y-2">
                  <Link href="/my-bookings" className="block">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent"
                      size="sm"
                    >
                      View all bookings
                    </Button>
                  </Link>
                  <Link href="/search-trains" className="block">
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent"
                      size="sm"
                    >
                      Book another trip
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="xl:hidden mt-6 space-y-3">
             <Card className="shadow-sm">
             <CardContent className="p-4">
               <div className="flex flex-wrap gap-2">
                 <Button
                   onClick={handleDownloadTickets}
                   className="flex-1 min-w-35"
                 >
                   <Download className="h-4 w-4 mr-2" />
                   Download PDF
                 </Button>
                 <Button
                   onClick={handleEmailTickets}
                   variant="outline"
                   className="flex-1 min-w-35 bg-transparent"
                 >
                   <Mail className="h-4 w-4 mr-2" />
                   Email
                 </Button>
                 <Button
                   onClick={handleShareBooking}
                   variant="outline"
                   className="flex-1 min-w-35 bg-transparent"
                 >
                   <Share2 className="h-4 w-4 mr-2" />
                   Share
                 </Button>
               </div>
             </CardContent>
           </Card>

           <div className="grid grid-cols-2 gap-3">
             <Link href="/my-bookings" className="block">
               <Button variant="outline" className="w-full bg-transparent">
                 View all bookings
               </Button>
             </Link>
             <Link href="/search-trains" className="block">
               <Button variant="outline" className="w-full bg-transparent">
                 Book another trip
               </Button>
             </Link>
           </div>
        </div>
      </div>
    </div>
  );
}
