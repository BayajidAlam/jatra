"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Mock Data
const bookings = [
  { id: "BK-2024-001", passenger: "John Doe", train: "Suborno Express", date: "2024-03-15", seat: "A3", amount: "650", status: "CONFIRMED" },
  { id: "BK-2024-002", passenger: "Jane Smith", train: "Mohanagar Godhuli", date: "2024-03-16", seat: "B5", amount: "550", status: "PENDING" },
  { id: "BK-2024-003", passenger: "Rahim Uddin", train: "Parabat Express", date: "2024-03-16", seat: "C1", amount: "480", status: "CANCELLED" },
  { id: "BK-2024-004", passenger: "Karim Ahmed", train: "Sonar Bangla", date: "2024-03-17", seat: "A1", amount: "800", status: "CONFIRMED" },
  { id: "BK-2024-005", passenger: "Fatema Begum", train: "Upaban Express", date: "2024-03-18", seat: "D4", amount: "320", status: "CONFIRMED" },
];

export default function BookingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Bookings Overview
        </h1>
        <div className="flex items-center gap-2">
           {/* Add Export/Filter buttons here later */}
        </div>
      </div>

      <Card className="dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 dark:border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 dark:border-slate-800">
          <CardTitle className="dark:text-slate-100">Recent Bookings</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
            <Input placeholder="Search bookings..." className="pl-8" />
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
              {bookings.map((booking) => (
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
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View Details</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
