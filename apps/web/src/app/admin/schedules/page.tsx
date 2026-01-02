"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Train, Clock, Edit2, Trash2, Filter } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { ScheduleDialog } from "@/components/admin/schedule-dialog";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import { useToast } from "@/hooks/use-toast";

// Mock Data
const initialSchedules = [
  { id: 1, trainName: "Suborno Express", trainNumber: "701", route: "Dhaka - Chattogram", departureTime: "07:00", arrivalTime: "12:30", frequency: "Daily", status: "On Time" },
  { id: 2, trainName: "Mohanagar Provati", trainNumber: "703", route: "Dhaka - Chattogram", departureTime: "07:45", arrivalTime: "13:40", frequency: "Daily", status: "Delayed" },
  { id: 3, trainName: "Parabat Express", trainNumber: "709", route: "Dhaka - Sylhet", departureTime: "06:20", arrivalTime: "13:00", frequency: "Weekly", status: "On Time" },
  { id: 4, trainName: "Turna Express", trainNumber: "705", route: "Dhaka - Chattogram", departureTime: "23:00", arrivalTime: "05:15", frequency: "Daily", status: "On Time" },
  { id: 5, trainName: "Sonar Bangla", trainNumber: "788", route: "Dhaka - Chattogram", departureTime: "17:00", arrivalTime: "22:15", frequency: "Weekend", status: "On Time" },
  { id: 6, trainName: "Kalni Express", trainNumber: "773", route: "Dhaka - Sylhet", departureTime: "15:00", arrivalTime: "21:30", frequency: "Daily", status: "Cancelled" },
];

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState(initialSchedules);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const { toast } = useToast();

  const filteredSchedules = schedules.filter((schedule) =>
    schedule.trainName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schedule.route.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSchedules.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSchedules = filteredSchedules.slice(startIndex, startIndex + itemsPerPage);

  const handleDelete = () => {
    if (deleteId) {
      setSchedules(schedules.filter(s => s.id !== deleteId));
      toast({
        title: "Schedule Deleted",
        description: "The schedule has been removed from the system.",
        variant: "destructive",
      });
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Schedules Management
        </h1>
        <ScheduleDialog />
      </div>

      <Card className="dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 dark:border-slate-800 animate-in fade-in-50 duration-500">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 dark:border-slate-800">
          <CardTitle className="dark:text-slate-100">Live Schedules</CardTitle>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search schedules..."
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
                    <DropdownMenuItem onClick={() => setSearchTerm("")}>All Schedules</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSearchTerm("On Time")}>On Time Only</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSearchTerm("Delayed")}>Delayed</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSearchTerm("Cancelled")}>Cancelled</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Train</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSchedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900 dark:text-slate-100">{schedule.trainName}</span>
                      <span className="text-xs text-slate-500">#{schedule.trainNumber}</span>
                    </div>
                  </TableCell>
                  <TableCell>{schedule.route}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {schedule.departureTime} - {schedule.arrivalTime}
                    </div>
                  </TableCell>
                  <TableCell>{schedule.frequency}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        schedule.status === "On Time"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : schedule.status === "Delayed"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {schedule.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                       <ScheduleDialog 
                        initialData={schedule}
                        trigger={
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 hover:bg-destructive/10 text-destructive"
                        onClick={() => setDeleteId(schedule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedSchedules.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No schedules found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        {totalPages > 1 && (
            <CardFooter className="flex items-center justify-between border-t dark:border-slate-800 py-4">
                <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredSchedules.length)} of {filteredSchedules.length} schedules
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

      <DeleteConfirmDialog 
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        itemName={`Schedule for ${schedules.find(s => s.id === deleteId)?.trainName}`}
      />
    </div>
  );
}
