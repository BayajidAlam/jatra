"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Train,
  MapPin,
  Calendar,
  Search,
  Download,
  Mail,
  Share2,
  QrCode,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Header from "@/components/layout/Header";

export function Loading() {
  return null;
}

// Mock ticket data matching backend contract
const mockTickets = [
  {
    ticketId: "TKT20251231001",
    bookingId: "BK20251231001",
    passengerName: "John Doe",
    train: { id: "train_701", name: "Suborno Express", number: "701" },
    route: { from: "Dhaka", to: "Chittagong" },
    date: "2025-01-15",
    departureAt: "2025-01-15T10:00:00Z",
    seat: "A3",
    coach: "AC_CHAIR",
    fare: 650,
    currency: "BDT",
    status: "VALID",
    issuedAt: "2025-12-31T10:40:00Z",
    expiresAt: "2025-01-15T12:00:00Z",
    qr: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23ffffff' width='200' height='200'/%3E%3Crect fill='%23000000' x='10' y='10' width='30' height='30'/%3E%3Crect fill='%23000000' x='160' y='10' width='30' height='30'/%3E%3Crect fill='%23000000' x='10' y='160' width='30' height='30'/%3E%3C/svg%3E",
    qrType: "BASE64",
    validation: null,
    payment: { method: "BKASH", amount: 650, status: "PAID" },
  },
  {
    ticketId: "TKT20251231002",
    bookingId: "BK20251231001",
    passengerName: "Jane Smith",
    train: { id: "train_701", name: "Suborno Express", number: "701" },
    route: { from: "Dhaka", to: "Chittagong" },
    date: "2025-01-15",
    departureAt: "2025-01-15T10:00:00Z",
    seat: "A4",
    coach: "AC_CHAIR",
    fare: 650,
    currency: "BDT",
    status: "VALID",
    issuedAt: "2025-12-31T10:40:00Z",
    expiresAt: "2025-01-15T12:00:00Z",
    qr: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23ffffff' width='200' height='200'/%3E%3Crect fill='%23000000' x='10' y='10' width='30' height='30'/%3E%3Crect fill='%23000000' x='160' y='10' width='30' height='30'/%3E%3Crect fill='%23000000' x='10' y='160' width='30' height='30'/%3E%3C/svg%3E",
    qrType: "BASE64",
    validation: null,
    payment: { method: "BKASH", amount: 650, status: "PAID" },
  },
  {
    ticketId: "TKT20251231003",
    bookingId: "BK20251230002",
    passengerName: "Ahmed Hassan",
    train: { id: "train_727", name: "Turna Nishitha", number: "727" },
    route: { from: "Dhaka", to: "Sylhet" },
    date: "2025-01-08",
    departureAt: "2025-01-08T08:00:00Z",
    seat: "B5",
    coach: "AC_FIRST",
    fare: 850,
    currency: "BDT",
    status: "USED",
    issuedAt: "2025-01-05T10:40:00Z",
    usedAt: "2025-01-08T08:15:00Z",
    qr: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23ffffff' width='200' height='200'/%3E%3Crect fill='%23000000' x='10' y='10' width='30' height='30'/%3E%3Crect fill='%23000000' x='160' y='10' width='30' height='30'/%3E%3Crect fill='%23000000' x='10' y='160' width='30' height='30'/%3E%3C/svg%3E",
    qrType: "BASE64",
    validation: {
      validatedBy: "inspector_33",
      validatedAt: "2025-01-08T08:15:00Z",
      location: "Dhaka Station",
    },
    payment: { method: "BKASH", amount: 850, status: "PAID" },
  },
  {
    ticketId: "TKT20251231004",
    bookingId: "BK20251220003",
    passengerName: "Fatima Ali",
    train: { id: "train_711", name: "Mohanagar Godhuli", number: "711" },
    route: { from: "Dhaka", to: "Chittagong" },
    date: "2024-12-28",
    departureAt: "2024-12-28T15:30:00Z",
    seat: "C2",
    coach: "AC_CHAIR",
    fare: 550,
    currency: "BDT",
    status: "EXPIRED",
    issuedAt: "2024-12-25T10:40:00Z",
    expiresAt: "2024-12-28T17:30:00Z",
    qr: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect fill='%23ffffff' width='200' height='200'/%3E%3Crect fill='%23000000' x='10' y='10' width='30' height='30'/%3E%3Crect fill='%23000000' x='160' y='10' width='30' height='30'/%3E%3Crect fill='%23000000' x='10' y='160' width='30' height='30'/%3E%3C/svg%3E",
    qrType: "BASE64",
    validation: null,
    payment: { method: "BKASH", amount: 550, status: "PAID" },
  },
];

interface Ticket {
  ticketId: string;
  bookingId: string;
  passengerName: string;
  train: { id: string; name: string; number: string };
  route: { from: string; to: string };
  date: string;
  departureAt: string;
  seat: string;
  coach: string;
  fare: number;
  currency: string;
  status: "VALID" | "USED" | "EXPIRED" | "CANCELLED";
  issuedAt: string;
  expiresAt?: string;
  usedAt?: string;
  qr: string;
  qrType: string;
  validation?: {
    validatedBy?: string;
    validatedAt?: string;
    location?: string;
  } | null;
  payment?: {
    method: string;
    amount: number;
    status: "PAID" | "COMPLETED" | "PENDING" | "FAILED";
  };
}

export default function MyTicketsPage() {
  const [activeTab, setActiveTab] = useState<
    "VALID" | "USED" | "EXPIRED" | "CANCELLED"
  >("VALID");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedQRs, setExpandedQRs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});

  const filteredTickets = mockTickets.filter((ticket) => {
    const matchesTab = ticket.status === activeTab;
    const matchesSearch =
      searchQuery === "" ||
      ticket.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.passengerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.train.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.bookingId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const toggleQR = (ticketId: string) => {
    setExpandedQRs((prev) =>
      prev.includes(ticketId)
        ? prev.filter((id) => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const handleDownloadPDF = (ticket: any) => {
    setIsLoading((prev) => ({ ...prev, [ticket.ticketId]: true }));
    setTimeout(() => {
      setIsLoading((prev) => ({ ...prev, [ticket.ticketId]: false }));
    }, 1500);
  };

  const handleEmailTicket = (ticket: any) => {
    console.log("[v0] Emailing ticket:", ticket.ticketId);
  };

  const handleShareTicket = (ticket: any) => {
    if (navigator.share) {
      navigator.share({
        title: `My Train Ticket - ${ticket.train.name}`,
        text: `Check out my ticket for ${ticket.train.name}`,
      });
    } else {
      console.log("[v0] Copying ticket link to clipboard");
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "VALID":
        return <CheckCircle2 className="h-4 w-4" />;
      case "USED":
        return <CheckCircle2 className="h-4 w-4" />;
      case "EXPIRED":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">My Tickets</h1>
          <p className="text-muted-foreground">
            View and manage your digital train tickets
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-border overflow-x-auto">
          {[
            {
              id: "VALID",
              label: "Valid",
              count: mockTickets.filter((t) => t.status === "VALID").length,
            },
            {
              id: "USED",
              label: "Used",
              count: mockTickets.filter((t) => t.status === "USED").length,
            },
            {
              id: "EXPIRED",
              label: "Expired",
              count: mockTickets.filter((t) => t.status === "EXPIRED").length,
            },
            {
              id: "CANCELLED",
              label: "Cancelled",
              count: mockTickets.filter((t) => t.status === "CANCELLED").length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-4 py-3 font-medium text-sm transition-all whitespace-nowrap border-b-2 flex items-center gap-2",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              <Badge
                variant={activeTab === tab.id ? "default" : "secondary"}
                className="text-xs"
              >
                {tab.count}
              </Badge>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ticket ID, name, train..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
        </div>

        {/* Tickets List */}
        {filteredTickets.length === 0 ? (
          <Card className="border-2">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <QrCode className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No tickets found</h3>
              <p className="text-muted-foreground mb-6">
                You don't have any {activeTab.toLowerCase()} tickets yet.
              </p>
              <Link href="/search-trains">
                <Button className="bg-primary hover:bg-primary/90">
                  Book a Ticket
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <Card
                key={ticket.ticketId}
                className="border-2 hover:border-primary/50 transition-all overflow-hidden"
              >
                <CardContent className="p-5">
                  {/* Ticket Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Train className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-base">
                          {ticket.train.name}
                        </h4>
                        <p className="text-xs text-muted-foreground font-mono">
                          {ticket.ticketId}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {ticket.passengerName}
                        </p>
                      </div>
                    </div>

                    <Badge
                      className={cn(
                        getStatusColor(ticket.status),
                        "flex items-center gap-1"
                      )}
                    >
                      {getStatusIcon(ticket.status)}
                      {ticket.status}
                    </Badge>
                  </div>

                  {/* Ticket Details */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">
                        Route
                      </p>
                      <p className="font-semibold flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {ticket.route.from} → {ticket.route.to}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">Date</p>
                      <p className="font-semibold flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(ticket.date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">Seat</p>
                      <p className="font-semibold">{ticket.seat}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">Fare</p>
                      <p className="font-semibold">৳{ticket.fare}</p>
                    </div>
                  </div>

                  {/* Validation or Expiry Info */}
                  {ticket.status === "USED" && ticket.validation && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3 mb-4">
                      <p className="text-xs text-blue-700 dark:text-blue-400">
                        <strong>Validated:</strong>{" "}
                        {formatDate(ticket.validation.validatedAt)} at{" "}
                        {formatTime(ticket.validation.validatedAt)} by{" "}
                        {ticket.validation.validatedBy} at{" "}
                        {ticket.validation.location}
                      </p>
                    </div>
                  )}

                  {ticket.status === "VALID" && ticket.expiresAt && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded p-3 mb-4">
                      <p className="text-xs text-amber-700 dark:text-amber-400">
                        <Clock className="h-3 w-3 inline mr-1" />
                        <strong>Valid until:</strong>{" "}
                        {formatDate(ticket.expiresAt)} at{" "}
                        {formatTime(ticket.expiresAt)}
                      </p>
                    </div>
                  )}

                  {ticket.status === "EXPIRED" && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3 mb-4">
                      <p className="text-xs text-red-700 dark:text-red-400">
                        <AlertCircle className="h-3 w-3 inline mr-1" />
                        <strong>Expired:</strong> This ticket is no longer valid
                      </p>
                    </div>
                  )}

                  {/* QR Section */}
                  {expandedQRs.includes(ticket.ticketId) &&
                    ticket.status !== "EXPIRED" &&
                    ticket.status !== "CANCELLED" && (
                      <>
                        <Separator className="my-4" />
                        <div className="flex flex-col items-center pt-2">
                          <p className="text-xs text-muted-foreground mb-3">
                            Scan with your phone to verify
                          </p>
                          <img
                            src={ticket.qr || "/placeholder.svg"}
                            alt="QR Code"
                            className="w-32 h-32 bg-white p-2 rounded-lg border border-border"
                          />
                        </div>
                      </>
                    )}

                  {/* Actions */}
                  <Separator className="my-4" />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleQR(ticket.ticketId)}
                      disabled={
                        ticket.status === "EXPIRED" ||
                        ticket.status === "CANCELLED"
                      }
                      className="text-primary"
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      {expandedQRs.includes(ticket.ticketId)
                        ? "Hide QR"
                        : "Show QR"}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadPDF(ticket)}
                      disabled={
                        isLoading[ticket.ticketId] ||
                        ticket.status === "CANCELLED"
                      }
                      className="text-primary"
                    >
                      {isLoading[ticket.ticketId] ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      PDF
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEmailTicket(ticket)}
                      disabled={ticket.status === "CANCELLED"}
                      className="text-primary"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShareTicket(ticket)}
                      disabled={ticket.status === "CANCELLED"}
                      className="text-primary"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>

                    <Link
                      href={`/my-bookings/${ticket.bookingId}`}
                      className="ml-auto"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent border-2"
                      >
                        View Booking
                      </Button>
                    </Link>
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
