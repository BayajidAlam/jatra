"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Mock booking data (would come from API based on bookingId)
const mockBookingData = {
  bookingId: "BK20251231001",
  status: "CONFIRMED",
  train: {
    name: "Suborno Express",
    number: "701",
    type: "Intercity",
  },
  route: {
    from: "Dhaka",
    to: "Chittagong",
    distance: "232 km",
  },
  schedule: {
    date: "Jan 15, 2025",
    departure: "10:00 AM",
    arrival: "2:30 PM",
    duration: "4h 30m",
  },
  passengers: [
    {
      name: "John Doe",
      age: 30,
      gender: "MALE",
      seat: "A3",
      fare: 650,
      ticketId: "TKT20251231001",
    },
    {
      name: "Jane Smith",
      age: 28,
      gender: "FEMALE",
      seat: "A4",
      fare: 650,
      ticketId: "TKT20251231002",
    },
    {
      name: "Bob Johnson",
      age: 35,
      gender: "MALE",
      seat: "B1",
      fare: 650,
      ticketId: "TKT20251231003",
    },
  ],
  payment: {
    method: "BKASH",
    amount: 1950,
    transactionId: "TXN20251231001",
    status: "COMPLETED",
  },
};

export default function BookingConfirmationPage() {
  const params = useParams();
  const bookingId = params.bookingId as string;

  // In real app, fetch booking data based on bookingId
  const booking = mockBookingData;

  const handleDownloadTickets = () => {
    console.log("[v0] Downloading tickets for booking:", bookingId);
    // Implement PDF download logic
  };

  const handleEmailTickets = () => {
    console.log("[v0] Emailing tickets for booking:", bookingId);
    // Implement email sending logic
  };

  const handleShareBooking = () => {
    console.log("[v0] Sharing booking:", bookingId);
    // Implement share functionality
  };

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
                  {booking.bookingId}
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
                      {booking.train.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Train {booking.train.number} · {booking.train.type}
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
                      {booking.schedule.departure}
                    </p>
                    <p className="font-semibold text-lg mb-1">
                      {booking.route.from}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{booking.schedule.date}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center px-4">
                    <div className="w-full h-px bg-border mb-2" />
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-muted rounded-full">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium">
                        {booking.schedule.duration}
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
                      {booking.schedule.arrival}
                    </p>
                    <p className="font-semibold text-lg mb-1">
                      {booking.route.to}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {booking.route.distance}
                    </p>
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
                  {booking.passengers.map((passenger, index) => (
                    <div
                      key={passenger.ticketId}
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
                            <p className="font-semibold">{passenger.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {passenger.age} yrs ·{" "}
                              {passenger.gender.charAt(0) +
                                passenger.gender.slice(1).toLowerCase()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="font-mono">
                            Seat {passenger.seat}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            ৳{passenger.fare}
                          </p>
                        </div>
                      </div>
                      <div className="pl-12">
                        <p className="text-xs text-muted-foreground font-mono">
                          {passenger.ticketId}
                        </p>
                      </div>
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
                      Tickets × {booking.passengers.length}
                    </span>
                    <span className="font-medium">
                      ৳{booking.payment.amount}
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
                      ৳{booking.payment.amount}
                    </span>
                  </div>

                  <Separator />

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Payment method
                      </span>
                      <Badge variant="outline">{booking.payment.method}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Transaction ID
                      </span>
                      <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                        {booking.payment.transactionId}
                      </code>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Payment status
                      </span>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {booking.payment.status}
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
