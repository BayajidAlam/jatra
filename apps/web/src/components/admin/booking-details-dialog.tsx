"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Train, MapPin, Calendar, Clock, User, Ticket, CreditCard, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingDetailsDialogProps {
  booking: {
    id: string;
    passenger: string;
    train: string;
    date: string;
    seat: string;
    amount: string;
    status: string;
    // Added fields for detail view
    email?: string;
    phone?: string;
    nid?: string;
    from?: string;
    to?: string;
    departureTime?: string;
    arrivalTime?: string;
    coach?: string;
    paymentMethod?: string;
    transactionId?: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookingDetailsDialog({ booking, open, onOpenChange }: BookingDetailsDialogProps) {
  if (!booking) return null;

  // Mocking extra details that would come from an API
  const details = {
    email: "john.doe@example.com",
    phone: "01712345678",
    nid: "1234567890123",
    from: "Dhaka (Kamalapur)",
    to: "Chattogram",
    departureTime: "07:00 AM",
    arrivalTime: "12:30 PM",
    coach: "KA",
    paymentMethod: "bKash",
    transactionId: "BKASH-TRX-123456",
    ...booking
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] overflow-hidden dark:bg-slate-900 dark:border-slate-800 p-0 gap-0">
        <DialogHeader className="p-6 bg-slate-50 dark:bg-slate-950/50 border-b dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-xl flex items-center gap-2">
                Booking Details
                <Badge 
                   variant={details.status === "CONFIRMED" ? "default" : details.status === "PENDING" ? "secondary" : "destructive"}
                   className={cn(
                     details.status === "CONFIRMED" && "bg-emerald-600 hover:bg-emerald-700",
                     details.status === "PENDING" && "bg-amber-500 hover:bg-amber-600"
                   )}
                >
                  {details.status}
                </Badge>
              </DialogTitle>
              <DialogDescription className="font-mono text-xs uppercase tracking-wider">
                System Reference: {details.id}
              </DialogDescription>
            </div>
            <Ticket className="h-10 w-10 text-primary opacity-20" />
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Passenger Information */}
          <section>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-primary">
              <User className="h-4 w-4" />
              Passenger Information
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase">Full Name</p>
                <p className="text-sm font-medium">{details.passenger}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase">Phone Number</p>
                <p className="text-sm font-medium">{details.phone}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase">Email Address</p>
                <p className="text-sm font-medium">{details.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase">National ID (NID)</p>
                <p className="text-sm font-medium">{details.nid}</p>
              </div>
            </div>
          </section>

          <Separator className="dark:bg-slate-800" />

          {/* Journey Details */}
          <section>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-primary">
              <Train className="h-4 w-4" />
              Journey Details
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-950/40 border dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-slate-900 rounded border dark:border-slate-800">
                        <Train className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-sm font-bold">{details.train}</p>
                        <p className="text-xs text-muted-foreground font-mono">Coach: {details.coach} • Seat: {details.seat}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-tighter">Travel Date</p>
                    <div className="flex items-center gap-1.5 justify-end">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm font-medium">{details.date}</span>
                    </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 relative">
                {/* Visual Line for Route */}
                <div className="absolute left-[calc(50%-0.5px)] top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />
                
                <div className="space-y-4">
                   <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                            <p className="text-xs text-muted-foreground uppercase">From</p>
                        </div>
                        <p className="text-sm font-medium">{details.from}</p>
                   </div>
                   <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground uppercase">Departure</p>
                        </div>
                        <p className="text-sm font-medium">{details.departureTime}</p>
                   </div>
                </div>

                <div className="space-y-4 text-right md:text-left">
                   <div className="space-y-1">
                        <div className="flex items-center gap-2 justify-end md:justify-start">
                             <p className="text-xs text-muted-foreground uppercase">To</p>
                            <MapPin className="h-3.5 w-3.5 text-red-500" />
                        </div>
                        <p className="text-sm font-medium">{details.to}</p>
                   </div>
                   <div className="space-y-1">
                        <div className="flex items-center gap-2 justify-end md:justify-start">
                             <p className="text-xs text-muted-foreground uppercase">Arrival</p>
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium">{details.arrivalTime}</p>
                   </div>
                </div>
              </div>
            </div>
          </section>

          <Separator className="dark:bg-slate-800" />

          {/* Payment Information */}
          <section>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-primary">
              <CreditCard className="h-4 w-4" />
              Payment Information
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase">Total Amount</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">৳{details.amount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase">Payment Method</p>
                <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
                    <p className="text-sm font-medium">{details.paymentMethod}</p>
                </div>
              </div>
              <div className="col-span-2 space-y-1">
                <p className="text-xs text-muted-foreground uppercase">Transaction ID</p>
                <p className="text-sm font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded inline-block">
                    {details.transactionId}
                </p>
              </div>
            </div>
          </section>
        </div>

        <Separator className="dark:bg-slate-800" />
        
        <div className="p-4 bg-slate-50 dark:bg-slate-950/30 flex justify-end gap-3">
             <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Close
             </Button>
             {details.status === "CONFIRMED" && (
                 <Button size="sm" className="gap-2">
                    <Ticket className="h-4 w-4" />
                    Print Ticket
                 </Button>
             )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
