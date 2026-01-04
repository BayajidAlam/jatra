"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, Eye, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { BookingDetailsDialog } from "@/components/admin/booking-details-dialog";
import { useAdminBookings, AdminBooking } from "@/hooks/use-admin-bookings";

export default function BookingsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const {
      bookings,
      pagination,
      isLoading,
      updateBookingStatus,
  } = useAdminBookings({
      page: currentPage,
      limit: itemsPerPage
  });
  
  const totalItems = pagination?.total || 0;
  const totalPages = pagination?.totalPages || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;

  const handleStatusUpdate = async (id: string, status: string) => {
    await updateBookingStatus({ id, status });
  };

  // Helper to transform API data to the dialog's expected format
  const handleViewDetails = (booking: AdminBooking) => {
      // Logic to extract seat numbers/coach from tickets array if available
      const seats = booking.tickets?.map(t => t.seatNumber).join(", ") || "N/A";
      // Logic to find coach if available
      const coach = "N/A"; // You might need to fetch this or include in API

      setSelectedBooking({
          id: booking.id,
          passenger: booking.user.name,
          email: booking.user.email,
          phone: booking.user.phone,
          train: booking.journey.train.modelName,
          date: new Date(booking.journey.journeyDate).toLocaleDateString(),
          departureTime: new Date(booking.journey.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          arrivalTime: new Date(booking.journey.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          from: "Unknown", // API needs to return Route stations
          to: "Unknown",   // API needs to return Route stations
          coach: coach,
          seat: seats,
          amount: booking.totalAmount.toString(),
          status: booking.status,
          transactionId: booking.payments?.[0]?.transactionId || "N/A",
          paymentMethod: booking.payments?.[0]?.method || "N/A",
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Bookings Management
        </h1>
      </div>

      <Card className="dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 dark:border-slate-800 animate-in fade-in-50 duration-500">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 dark:border-slate-800">
            <CardTitle className="dark:text-slate-100">All Bookings</CardTitle>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bookings..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Passenger</TableHead>
                <TableHead>Journey Details</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                  <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">Loading bookings...</TableCell>
                  </TableRow>
              ) : bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-mono text-xs">{booking.id.slice(0, 8)}...</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900 dark:text-slate-100">{booking.user.name}</span>
                      <span className="text-xs text-slate-500">{booking.user.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span className="font-medium">{booking.journey.train.modelName}</span>
                      <span className="text-xs text-slate-500">
                          {new Date(booking.journey.journeyDate).toLocaleDateString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>৳{booking.totalAmount}</TableCell>
                  <TableCell>
                    <Badge 
                        variant={booking.status === "CONFIRMED" ? "default" : booking.status === "PENDING" ? "secondary" : "destructive"}
                        className={
                            booking.status === "CONFIRMED" ? "bg-emerald-600 hover:bg-emerald-700" :
                            booking.status === "PENDING" ? "bg-amber-500 hover:bg-amber-600" : ""
                        }
                    >
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewDetails(booking)}>
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleStatusUpdate(booking.id, "CONFIRMED")}>
                          <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Mark Confirmed
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusUpdate(booking.id, "PENDING")}>
                           <AlertCircle className="mr-2 h-4 w-4 text-amber-500" /> Mark Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusUpdate(booking.id, "CANCELLED")} className="text-destructive">
                          <XCircle className="mr-2 h-4 w-4" /> Cloud Cancel
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && bookings.length === 0 && (
                  <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No bookings found.</TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
         {totalPages > 1 && (
            <CardFooter className="flex items-center justify-between border-t dark:border-slate-800 py-4">
                <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} bookings
                </div>
                <Pagination className="mx-0 w-auto">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <PaginationItem key={page}>
                                <PaginationLink 
                                    isActive={currentPage === page}
                                    onClick={() => setCurrentPage(page)}
                                    className="cursor-pointer"
                                >
                                    {page}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </CardFooter>
        )}
      </Card>

      <BookingDetailsDialog 
        booking={selectedBooking} 
        open={selectedBooking !== null} 
        onOpenChange={(open) => !open && setSelectedBooking(null)} 
      />
    </div>
  );
}
