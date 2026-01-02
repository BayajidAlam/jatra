"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Search, Edit2, Trash2, Filter } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
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
import { RouteDialog } from "@/components/admin/route-dialog";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import { useToast } from "@/hooks/use-toast";

// Mock Data
const initialRoutes = [
  { id: 1, routeName: "Dhaka - Chattogram", stations: 12, distance: "320 km", duration: "5h 30m", status: "Active" },
  { id: 2, routeName: "Dhaka - Sylhet", stations: 15, distance: "280 km", duration: "6h 15m", status: "Active" },
  { id: 3, routeName: "Dhaka - Rajshahi", stations: 9, distance: "240 km", duration: "4h 45m", status: "Maintenance" },
  { id: 4, routeName: "Dhaka - Khulna", stations: 11, distance: "380 km", duration: "8h 30m", status: "Active" },
  { id: 5, routeName: "Dhaka - Mymensingh", stations: 7, distance: "120 km", duration: "2h 45m", status: "Active" },
  { id: 6, routeName: "Dhaka - Noakhali", stations: 14, distance: "210 km", duration: "5h 00m", status: "Active" },
];

export default function RoutesPage() {
  const [routes, setRoutes] = useState(initialRoutes);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const { toast } = useToast();

  const filteredRoutes = routes.filter((route) =>
    route.routeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRoutes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRoutes = filteredRoutes.slice(startIndex, startIndex + itemsPerPage);

  const handleDelete = () => {
    if (deleteId) {
      setRoutes(routes.filter(r => r.id !== deleteId));
      toast({
        title: "Route Deleted",
        description: "The route has been removed from the system.",
        variant: "destructive",
      });
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Route Management
        </h1>
        <RouteDialog />
      </div>

      <Card className="dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 dark:border-slate-800 animate-in fade-in-50 duration-500">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 dark:border-slate-800">
          <CardTitle className="dark:text-slate-100">All Routes</CardTitle>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search routes..."
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
                    <DropdownMenuItem onClick={() => setSearchTerm("")}>All Routes</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSearchTerm("Active")}>Active Only</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSearchTerm("Maintenance")}>Maintenance</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route Name</TableHead>
                <TableHead>Stations</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead>Avg. Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRoutes.map((route) => (
                <TableRow key={route.id}>
                  <TableCell className="font-medium">{route.routeName}</TableCell>
                  <TableCell>{route.stations} Stops</TableCell>
                  <TableCell>{route.distance}</TableCell>
                  <TableCell>{route.duration}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        route.status === "Active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {route.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                       <RouteDialog 
                        initialData={route}
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
                        onClick={() => setDeleteId(route.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedRoutes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No routes found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        {totalPages > 1 && (
            <CardFooter className="flex items-center justify-between border-t dark:border-slate-800 py-4">
                <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredRoutes.length)} of {filteredRoutes.length} routes
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
        itemName={routes.find(r => r.id === deleteId)?.routeName}
      />
    </div>
  );
}
