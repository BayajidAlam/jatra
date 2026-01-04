"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Train,
  User,
  Download,
  Mail,
  Share2,
  Copy,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Printer,
  Flag,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Header from "@/components/layout/Header";

// Mock ticket data matching backend contract
const mockTicketData = {
  ticketId: "TKT20251231001",
  bookingId: "BK20251231001",
  passengerName: "John Doe",
  passengerType: "ADULT",
  train: { id: "train_701", name: "Suborno Express", number: "701" },
  route: { from: "Dhaka", to: "Chittagong" },
  date: "2025-01-15",
  departureAt: "2025-01-15T10:00:00Z",
  arrivalAt: "2025-01-15T14:30:00Z",
  seat: "A3",
  coach: "AC_CHAIR",
  platform: "3",
  fare: 650,
  currency: "BDT",
  status: "VALID",
  issuedAt: "2025-12-31T10:40:00Z",
  expiresAt: "2025-01-15T12:00:00Z",
  usedAt: null,
  qr: "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 200%22%3E%3Crect fill=%22%23ffffff%22 width=%22200%22 height=%22200%22/%3E%3Crect fill=%22%23000000%22 x=%2210%22 y=%2210%22 width=%2230%22 height=%2230%22/%3E%3Crect fill=%22%23000000%22 x=%22160%22 y=%2210%22 width=%2230%22 height=%2230%22/%3E%3Crect fill=%22%23000000%22 x=%2210%22 y=%22160%22 width=%2230%22 height=%2230%22/%3E%3Crect fill=%22%23000000%22 x=%2250%22 y=%2250%22 width=%2220%22 height=%2220%22/%3E%3Crect fill=%22%23000000%22 x=%22130%22 y=%2250%22 width=%2220%22 height=%2220%22/%3E%3Crect fill=%22%23000000%22 x=%2250%22 y=%22130%22 width=%2220%22 height=%2220%22/%3E%3C/svg%3E",
  qrType: "BASE64",
  ticketPdfUrl: "/api/tickets/TKT20251231001/pdf",
  payment: {
    method: "BKASH",
    amount: 650,
    status: "PAID",
  },
  bookedAt: "2025-12-31T10:30:00Z",
  contact: { email: "j***@example.com", phone: "+8801*******" },
  validationHistory: [
    {
      validatedBy: "inspector_33",
      validatedAt: "2025-01-15T10:05:00Z",
      location: "Dhaka Station",
      note: "Gate A",
    },
  ],
};

export default function TicketDetailPage() {
  const params = useParams();
  const ticketId = params.ticketId as string;
  const [showQR, setShowQR] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
  const [copied, setCopied] = useState(false);

  // In real app, fetch ticket data based on ticketId
  const ticket = mockTicketData;

  const handleDownloadPDF = () => {
    setIsLoading((prev) => ({ ...prev, pdf: true }));
    setTimeout(() => setIsLoading((prev) => ({ ...prev, pdf: false })), 1500);
  };

  const handleEmailTicket = () => {
    setIsLoading((prev) => ({ ...prev, email: true }));
    setTimeout(() => setIsLoading((prev) => ({ ...prev, email: false })), 1500);
  };

  const handleShareTicket = () => {
    if (navigator.share) {
      navigator.share({
        title: `My Train Ticket - ${ticket.train.name}`,
        text: `Train: ${ticket.train.name} from ${ticket.route.from} to ${ticket.route.to}`,
        url: window.location.href,
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyTicketId = () => {
    navigator.clipboard.writeText(ticket.ticketId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "VALID":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "USED":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      case "EXPIRED":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      case "CANCELLED":
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 lg:px-8 max-w-5xl py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link href="/my-tickets">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold">Ticket Details</h1>
            </div>
          </div>
          <Badge className={cn(getStatusColor(ticket.status))}>
            {ticket.status === "VALID" && (
              <CheckCircle2 className="h-3 w-3 mr-1" />
            )}
            {ticket.status === "USED" && (
              <CheckCircle2 className="h-3 w-3 mr-1" />
            )}
            {ticket.status === "EXPIRED" && (
              <AlertCircle className="h-3 w-3 mr-1" />
            )}
            {ticket.status}
          </Badge>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 max-w-5xl py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Ticket Card - Journey Overview */}
            <Card className="overflow-hidden border-2">
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                      Train Journey
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(ticket.departureAt)}
                    </p>
                  </div>
                </div>

                {/* Journey Timeline */}
                <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Departure
                    </p>
                    <p className="text-3xl font-bold">
                      {formatTime(ticket.departureAt)}
                    </p>
                    <p className="text-base font-semibold text-foreground">
                      {ticket.route.from}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Platform {ticket.platform}
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-3">
                    <div className="text-xs font-medium text-muted-foreground text-center">
                      {ticket.train.number}
                    </div>
                    <div className="h-px w-8 bg-border" />
                    <Train className="h-4 w-4 text-muted-foreground" />
                    <div className="h-px w-8 bg-border" />
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">
                      Arrival
                    </p>
                    <p className="text-3xl font-bold">
                      {formatTime(ticket.arrivalAt)}
                    </p>
                    <p className="text-base font-semibold text-foreground">
                      {ticket.route.to}
                    </p>
                  </div>
                </div>

                {/* Ticket Info Grid */}
                <Separator className="my-6" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Train Name
                    </p>
                    <p className="font-semibold text-sm">{ticket.train.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Seat</p>
                    <p className="font-semibold text-sm">{ticket.seat}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Coach</p>
                    <p className="font-semibold text-sm">{ticket.coach}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Fare</p>
                    <p className="font-semibold text-sm">৳{ticket.fare}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Passenger Info */}
            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Passenger Information
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Full Name
                    </p>
                    <p className="font-semibold">{ticket.passengerName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Passenger Type
                    </p>
                    <Badge variant="secondary">{ticket.passengerType}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* QR Code Section */}
            {ticket.status !== "EXPIRED" && ticket.status !== "CANCELLED" && (
              <Card className="border-2">
                <CardHeader className="pb-3">
                  <button
                    onClick={() => setShowQR(!showQR)}
                    className="flex items-center justify-between w-full hover:opacity-75 transition-opacity"
                  >
                    <CardTitle className="text-base flex items-center gap-2">
                      <QrCode className="h-4 w-4 text-muted-foreground" />
                      Digital Ticket Code
                    </CardTitle>
                    <span className="text-xs text-muted-foreground">
                      {showQR ? "Hide" : "Show"}
                    </span>
                  </button>
                </CardHeader>
                {showQR && (
                  <>
                    <Separator />
                    <CardContent className="pt-4">
                      <p className="text-xs text-muted-foreground mb-4">
                        Scan this code at the station to validate your ticket
                      </p>
                      <div className="flex justify-center">
                        <img
                          src={ticket.qr || "/placeholder.svg"}
                          alt="QR Code"
                          className="w-40 h-40 bg-white p-2 border border-border rounded-lg"
                        />
                      </div>
                    </CardContent>
                  </>
                )}
              </Card>
            )}

            {/* Validation History */}
            {ticket.status === "USED" &&
              ticket.validationHistory &&
              ticket.validationHistory.length > 0 && (
                <Card className="border-2">
                  <CardHeader className="pb-3">
                    <button
                      onClick={() => setShowValidation(!showValidation)}
                      className="flex items-center justify-between w-full hover:opacity-75 transition-opacity"
                    >
                      <CardTitle className="text-base flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        Validation History
                      </CardTitle>
                      <span className="text-xs text-muted-foreground">
                        {showValidation ? "Hide" : "Show"}
                      </span>
                    </button>
                  </CardHeader>
                  {showValidation && (
                    <>
                      <Separator />
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          {ticket.validationHistory.map((validation, idx) => (
                            <div
                              key={idx}
                              className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                                  Validated
                                </p>
                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                  {formatDate(validation.validatedAt)} at{" "}
                                  {formatTime(validation.validatedAt)}
                                </p>
                              </div>
                              <div className="space-y-1 text-xs text-blue-800 dark:text-blue-200">
                                <p>
                                  <strong>Location:</strong>{" "}
                                  {validation.location}
                                </p>
                                <p>
                                  <strong>Inspector:</strong>{" "}
                                  {validation.validatedBy}
                                </p>
                                {validation.note && (
                                  <p>
                                    <strong>Notes:</strong> {validation.note}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </>
                  )}
                </Card>
              )}

            {/* Status Messages */}
            {ticket.status === "VALID" && ticket.expiresAt && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-amber-900 dark:text-amber-100 mb-1">
                      Valid Until
                    </p>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      {formatDate(ticket.expiresAt)} at{" "}
                      {formatTime(ticket.expiresAt)} •{" "}
                      {formatRelativeTime(ticket.expiresAt)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {ticket.status === "EXPIRED" && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-red-900 dark:text-red-100">
                      This Ticket Has Expired
                    </p>
                    <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                      This ticket is no longer valid for travel.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Ticket ID Card */}
            <Card className="border-2 sticky top-20">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-2 uppercase font-semibold tracking-wide">
                  Ticket ID
                </p>
                <div className="flex items-center gap-2 mb-3">
                  <code className="text-sm font-mono font-semibold flex-1 break-all">
                    {ticket.ticketId}
                  </code>
                  <button
                    onClick={handleCopyTicketId}
                    className="p-1.5 hover:bg-muted rounded transition-colors"
                    title="Copy ticket ID"
                  >
                    <Copy
                      className={cn(
                        "h-4 w-4",
                        copied ? "text-green-600" : "text-muted-foreground"
                      )}
                    />
                  </button>
                </div>
                {copied && (
                  <p className="text-xs text-green-600 font-medium">Copied!</p>
                )}
              </CardContent>
            </Card>

            {/* Booking Summary */}
            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Booking Details</CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Booking ID
                  </p>
                  <Link
                    href={`/bookings/${ticket.bookingId}`}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    {ticket.bookingId}
                  </Link>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Issued</p>
                  <p className="text-sm font-semibold">
                    {formatDate(ticket.issuedAt)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeTime(ticket.issuedAt)}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Payment Status
                  </p>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {ticket.payment?.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Payment Method
                  </p>
                  <p className="text-sm font-semibold">
                    {ticket.payment?.method}
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Contact Email
                  </p>
                  <p className="text-sm font-mono">{ticket.contact.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Contact Phone
                  </p>
                  <p className="text-sm font-mono">{ticket.contact.phone}</p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-2 flex flex-col">
              <Button
                onClick={handleDownloadPDF}
                disabled={isLoading.pdf}
                className="w-full h-9"
              >
                {isLoading.pdf ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Download PDF
              </Button>

              <Button
                onClick={handleEmailTicket}
                disabled={isLoading.email}
                variant="outline"
                className="w-full h-9 bg-transparent border-2"
              >
                {isLoading.email ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                Email Ticket
              </Button>

              <Button
                onClick={handleShareTicket}
                variant="outline"
                className="w-full h-9 bg-transparent border-2"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>

              <Button
                onClick={handlePrint}
                variant="outline"
                className="w-full h-9 bg-transparent border-2"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>

              <Button
                variant="outline"
                className="w-full h-9 bg-transparent border-2 text-red-600 hover:bg-red-50"
              >
                <Flag className="h-4 w-4 mr-2" />
                Report Problem
              </Button>
            </div>

            {/* Travel Guidelines */}
            <Card className="border-2 bg-muted/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Travel Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2 text-muted-foreground">
                <p>✓ Arrive 30 mins before departure</p>
                <p>✓ Bring a valid ID</p>
                <p>✓ Carry this ticket with you</p>
                <p>✓ Check baggage policy</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
