"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Eye, Filter } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { BookingDetailsDialog } from "@/components/admin/booking-details-dialog";

// Mock Data
const initialBookings = [
  { id: "BK-2024-001", passenger: "John Doe", train: "Suborno Express", date: "2024-03-15", seat: "A3", amount: "650", status: "CONFIRMED" },
  { id: "BK-2024-002", passenger: "Jane Smith", train: "Mohanagar Godhuli", date: "2024-03-16", seat: "B5", amount: "550", status: "PENDING" },
  { id: "BK-2024-003", passenger: "Rahim Uddin", train: "Parabat Express", date: "2024-03-16", seat: "C1", amount: "480", status: "CANCELLED" },
  { id: "BK-2024-004", passenger: "Karim Ahmed", train: "Sonar Bangla", date: "2024-03-17", seat: "A1", amount: "800", status: "CONFIRMED" },
  { id: "BK-2024-005", passenger: "Fatema Begum", train: "Upaban Express", date: "2024-03-18", seat: "D4", amount: "320", status: "CONFIRMED" },
  { id: "BK-2024-006", passenger: "Abul Kashem", train: "Suborno Express", date: "2024-03-19", seat: "F2", amount: "650", status: "PENDING" },
  { id: "BK-2024-007", passenger: "Zahara Islam", train: "Kalni Express", date: "2024-03-20", seat: "G1", amount: "420", status: "CONFIRMED" },
];

export default function BookingsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const itemsPerPage = 5;

  const filteredBookings = initialBookings.filter((booking) =>
    booking.passenger.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.train.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Bookings Overview
        </h1>
      </div>

      <Card className="dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 dark:border-slate-800 animate-in fade-in-50 duration-500">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 dark:border-slate-800">
          <CardTitle className="dark:text-slate-100">Recent Bookings</CardTitle>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSearchTerm("")}>All Status</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSearchTerm("CONFIRMED")}>Confirmed</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSearchTerm("PENDING")}>Pending</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSearchTerm("CANCELLED")}>Cancelled</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Passenger</TableHead>
                <TableHead>Train</TableHead>
                <TableHead>Travel Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">{booking.id}</TableCell>
                  <TableCell>{booking.passenger}</TableCell>
                  <TableCell>{booking.train}</TableCell>
                  <TableCell>{booking.date}</TableCell>
                  <TableCell>৳{booking.amount}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        booking.status === "CONFIRMED"
                          ? "default"
                          : booking.status === "PENDING"
                          ? "secondary"
                          : "destructive"
                      }
                      className={
                        booking.status === "CONFIRMED" 
                        ? "bg-emerald-600 hover:bg-emerald-700" 
                        : booking.status === "PENDING"
                        ? "bg-amber-500 hover:bg-amber-600"
                        : ""
                      }
                    >
                      {booking.status}
                    </Badge>
                  </TableCell>
                   <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setIsDetailsOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View Details</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedBookings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No bookings found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        {totalPages > 1 && (
          <CardFooter className="flex items-center justify-between border-t dark:border-slate-800 py-4">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredBookings.length)} of {filteredBookings.length} bookings
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
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </div>
  );
}
