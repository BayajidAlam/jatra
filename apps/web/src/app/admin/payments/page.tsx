"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Filter, ArrowUpRight, ArrowDownRight, CreditCard, Wallet, Landmark, Loader2, Minus } from "lucide-react";
// ... (imports)

// ... (inside component)

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
import { useAdminPayments, useAdminPaymentStats } from "@/hooks/use-admin-payments";
import { SmartPagination } from "@/components/ui/smart-pagination";

import { useDebounce } from "@/hooks/use-debounce";

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { data, isLoading } = useAdminPayments(currentPage, itemsPerPage, debouncedSearch, statusFilter);
  const { data: statsData, isLoading: isStatsLoading } = useAdminPaymentStats();

  const payments = data?.payments || [];
  const totalPages = data?.pagination?.totalPages || 1;

  const isZero = (val: string) => val === "0" || val === "0.0";
  const isPositive = (val: string) => !val.startsWith('-') && !isZero(val);

  const stats = [
    { 
        label: "Successful Payments", 
        value: statsData ? `৳ ${statsData.successfulAmount.toLocaleString()}` : "...", 
        change: statsData ? `${isPositive(statsData.successfulGrowth) ? '+' : ''}${statsData.successfulGrowth}%` : "...",
        trending: statsData && isPositive(statsData.successfulGrowth) ? "up" : (statsData && isZero(statsData.successfulGrowth) ? "neutral" : "down"), 
        icon: ArrowUpRight, 
        color: "text-emerald-500", 
        bg: "bg-emerald-100 dark:bg-emerald-950/30" 
    },
    { 
        label: "Pending Amount", 
        value: statsData ? `৳ ${statsData.pendingAmount.toLocaleString()}` : "...", 
        change: statsData ? `${isPositive(statsData.pendingGrowth) ? '+' : ''}${statsData.pendingGrowth}%` : "...",
        trending: statsData && isPositive(statsData.pendingGrowth) ? "up" : (statsData && isZero(statsData.pendingGrowth) ? "neutral" : "down"),
        icon: ArrowDownRight, 
        color: "text-blue-500", 
        bg: "bg-blue-100 dark:bg-blue-950/30" 
    },
    { 
        label: "Refunded", 
        value: statsData ? `৳ ${statsData.refundedAmount.toLocaleString()}` : "...", 
        change: statsData ? `${isPositive(statsData.refundedGrowth) ? '+' : ''}${statsData.refundedGrowth}%` : "...",
        trending: statsData && isPositive(statsData.refundedGrowth) ? "up" : (statsData && isZero(statsData.refundedGrowth) ? "neutral" : "down"), 
        icon: ArrowUpRight, 
        color: "text-amber-500", 
        bg: "bg-amber-100 dark:bg-amber-950/30" 
    },
    { 
        label: "Failed Transactions", 
        value: statsData ? statsData.failedCount.toString() : "...", 
        change: statsData ? `${isPositive(statsData.failedGrowth) ? '+' : ''}${statsData.failedGrowth}%` : "...",
        trending: statsData && isPositive(statsData.failedGrowth) ? "up" : (statsData && isZero(statsData.failedGrowth) ? "neutral" : "down"), 
        icon: Filter, 
        color: "text-red-500", 
        bg: "bg-red-100 dark:bg-red-950/30" 
    },
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
                <div className="text-2xl font-bold">
                    {isStatsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stat.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                  <span className={cn("font-medium flex items-center", 
                      stat.trending === "up" ? "text-emerald-500" : 
                      stat.trending === "down" ? "text-amber-500" : "text-muted-foreground"
                  )}>
                    {stat.trending === "up" && <ArrowUpRight className="h-3 w-3 mr-1" />}
                    {stat.trending === "down" && <ArrowDownRight className="h-3 w-3 mr-1" />}
                    {stat.trending === "neutral" && <Minus className="h-3 w-3 mr-1" />}
                    {stat.change}
                  </span>{" "}
                  <span className="ml-1">from last week</span>
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
              {isLoading ? (
                  <TableRow>
                      <TableCell colSpan={8} className="h-32 text-center">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                      </TableCell>
                  </TableRow>
              ) : payments.length > 0 ? (
                payments.map((payment) => (
                    <TableRow key={payment.id} className="hover:bg-muted/30 dark:hover:bg-slate-800/30">
                    <TableCell className="pl-6 font-medium text-xs">{payment.id}</TableCell>
                    <TableCell className="text-blue-500 hover:underline cursor-pointer text-xs">
                        <div className="flex flex-col">
                            <span>{payment.booking?.id || "N/A"}</span>
                            <span className="text-[10px] text-muted-foreground">{payment.booking?.user?.phone || "Unknown"}</span>
                        </div>
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                        {payment.currency} {payment.amount}
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                        {payment.paymentMethod?.includes("CARD") ? <CreditCard className="h-3.5 w-3.5" /> : 
                        (payment.paymentMethod?.includes("BKASH") || payment.paymentMethod?.includes("NAGAD")) ? <Wallet className="h-3.5 w-3.5" /> : 
                        <Landmark className="h-3.5 w-3.5" />}
                        <span className="capitalize text-xs">{payment.paymentMethod?.replace(/_/g, " ").toLowerCase()}</span>
                        </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{payment.transactionId || "-"}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                        {new Date(payment.createdAt).toLocaleDateString()}
                    </TableCell>
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
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    No transactions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        {totalPages > 1 && (
          <CardFooter className="flex items-center justify-between border-t dark:border-slate-800 py-4 px-6">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <SmartPagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
