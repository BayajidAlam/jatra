"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Filter, ArrowUpRight, ArrowDownRight, CreditCard, Wallet, Landmark } from "lucide-react";
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
import { cn } from "@/lib/utils";

// Mock Data
const payments = [
  { id: "PAY-1001", bookingId: "BK-2024-001", amount: 650, method: "bKash", status: "COMPLETED", date: "2024-03-01 10:20 AM", transactionId: "BKASH-TRX-7781" },
  { id: "PAY-1002", bookingId: "BK-2024-002", amount: 550, method: "Nagad", status: "COMPLETED", date: "2024-03-01 11:45 AM", transactionId: "NG-TRX-9902" },
  { id: "PAY-1003", bookingId: "BK-2024-003", amount: 480, method: "Visa Card", status: "FAILED", date: "2024-03-02 09:15 AM", transactionId: "VISA-4422" },
  { id: "PAY-1004", bookingId: "BK-2024-004", amount: 800, method: "Rocket", status: "COMPLETED", date: "2024-03-02 02:30 PM", transactionId: "RKT-1156" },
  { id: "PAY-1005", bookingId: "BK-2024-005", amount: 320, method: "bKash", status: "PENDING", date: "2024-03-02 05:00 PM", transactionId: "-" },
  { id: "PAY-1006", bookingId: "BK-2024-006", amount: 1200, method: "Mastercard", status: "COMPLETED", date: "2024-03-03 12:10 PM", transactionId: "MC-9983" },
  { id: "PAY-1007", bookingId: "BK-2024-007", amount: 450, method: "Nagad", status: "REFUNDED", date: "2024-03-03 04:22 PM", transactionId: "NG-REF-112" },
];

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = 
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPayments = filteredPayments.slice(startIndex, startIndex + itemsPerPage);

  const stats = [
    { label: "Successful Payments", value: "৳ 4,12,000", change: "+12.5%", trending: "up", icon: ArrowUpRight, color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-950/30" },
    { label: "Pending Amount", value: "৳ 18,400", change: "-5.2%", trending: "down", icon: ArrowDownRight, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-950/30" },
    { label: "Refunded", value: "৳ 12,200", change: "+2.1%", trending: "up", icon: ArrowUpRight, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-950/30" },
    { label: "Failed Transactions", value: "12", change: "+1", trending: "up", icon: Filter, color: "text-red-500", bg: "bg-red-100 dark:bg-red-950/30" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Payments Management
        </h1>
        <Button variant="outline" className="gap-2">
            Download CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="dark:bg-slate-900 dark:border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <div className={cn("p-2 rounded-full", stat.bg)}>
                  <stat.icon className={cn("h-4 w-4", stat.color)} />
                </div>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className={cn("font-medium", stat.trending === "up" ? "text-emerald-500" : "text-amber-500")}>
                    {stat.change}
                  </span>{" "}
                  from last week
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 dark:border-slate-800 animate-in fade-in-50 duration-500">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 dark:border-slate-800 border-b">
          <CardTitle className="dark:text-slate-100">Transaction History</CardTitle>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search payment/booking..."
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
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Status</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("COMPLETED")}>Completed</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("PENDING")}>Pending</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("FAILED")}>Failed</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("REFUNDED")}>Refunded</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 dark:bg-slate-900/50">
                <TableHead className="pl-6">Payment ID</TableHead>
                <TableHead>Booking</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPayments.map((payment) => (
                <TableRow key={payment.id} className="hover:bg-muted/30 dark:hover:bg-slate-800/30">
                  <TableCell className="pl-6 font-medium">{payment.id}</TableCell>
                  <TableCell className="text-blue-500 hover:underline cursor-pointer">{payment.bookingId}</TableCell>
                  <TableCell className="font-semibold text-slate-900 dark:text-slate-100">৳{payment.amount}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {payment.method.includes("Card") ? <CreditCard className="h-3.5 w-3.5" /> : 
                       payment.method.includes("bKash") || payment.method.includes("Nagad") ? <Wallet className="h-3.5 w-3.5" /> : 
                       <Landmark className="h-3.5 w-3.5" />}
                      {payment.method}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{payment.transactionId}</TableCell>
                  <TableCell className="text-muted-foreground">{payment.date}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        payment.status === "COMPLETED" ? "default" : 
                        payment.status === "FAILED" ? "destructive" : 
                        payment.status === "PENDING" ? "secondary" : "outline"
                      }
                      className={cn(
                        payment.status === "COMPLETED" && "bg-emerald-600 hover:bg-emerald-700",
                        payment.status === "PENDING" && "bg-amber-500 hover:bg-amber-600",
                        payment.status === "REFUNDED" && "text-amber-500 border-amber-500"
                      )}
                    >
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button variant="ghost" size="sm" className="h-8 hover:bg-slate-100 dark:hover:bg-slate-800">
                        Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedPayments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    No transactions matched your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        {totalPages > 1 && (
          <CardFooter className="flex items-center justify-between border-t dark:border-slate-800 py-4 px-6">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredPayments.length)} of {filteredPayments.length} transactions
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
    </div>
  );
}
