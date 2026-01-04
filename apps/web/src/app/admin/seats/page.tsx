"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Edit2, Trash2, Sofa, Armchair } from "lucide-react";
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
import { SeatDialog } from "@/components/admin/seat-dialog";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import { useAdminSeats } from "@/hooks/use-admin-seats";

export default function SeatsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const {
    seats,
    pagination,
    isLoading,
    deleteSeat,
    isDeleting,
  } = useAdminSeats({
    page: currentPage,
    limit: itemsPerPage,
  });

  const totalItems = pagination?.total || 0;
  const totalPages = pagination?.totalPages || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;

  const handleDelete = async () => {
    if (deleteId) {
      await deleteSeat(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Seat Management
        </h1>
        <SeatDialog />
      </div>

      <Card className="dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 dark:border-slate-800 animate-in fade-in-50 duration-500">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 dark:border-slate-800">
          <CardTitle className="dark:text-slate-100">All Seats</CardTitle>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search seats..."
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
                <TableHead>Seat Number</TableHead>
                <TableHead>Coach</TableHead>
                <TableHead>Train</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Fare</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Loading seats...
                  </TableCell>
                </TableRow>
              ) : seats.map((seat) => (
                <TableRow key={seat.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <Sofa className="h-4 w-4 text-muted-foreground" />
                        <span className="font-bold">{seat.seatNumber}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                      <Badge variant="outline" className="font-mono">
                          {seat.coach.coachCode}
                      </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                        <span>{seat.coach.train.name}</span>
                         <span className="text-xs text-slate-500">#{seat.coach.train.trainNumber}</span>
                    </div>
                  </TableCell>
                   <TableCell>
                     <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                         {seat.seatType.replace('_', ' ')}
                     </span>
                  </TableCell>
                  <TableCell className="font-medium text-emerald-600 dark:text-emerald-400">
                      ৳{seat.baseFare}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                       <SeatDialog 
                        initialData={seat}
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
                        onClick={() => setDeleteId(seat.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && seats.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No seats found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        {totalPages > 1 && (
            <CardFooter className="flex items-center justify-between border-t dark:border-slate-800 py-4">
                <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} seats
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
        isLoading={isDeleting}
        itemName={`Seat ${seats.find(s => s.id === deleteId)?.seatNumber}`}
      />
    </div>
  );
}
