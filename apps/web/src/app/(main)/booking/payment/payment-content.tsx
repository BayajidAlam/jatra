"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import {
  Train,
  ArrowLeft,
  User,
  Users,
  CreditCard,
  Smartphone,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";


type PaymentMethod = "BKASH" | "NAGAD" | "CARD" | "ROCKET" | null;

function PaymentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Dynamic booking data from URL
  const seatIdsParam = searchParams.get("seatIds");
  const seatNumbersParam = searchParams.get("seatNumbers");
  const seatIds = seatIdsParam ? seatIdsParam.split(",") : [];
  const seatNumbers = seatNumbersParam ? seatNumbersParam.split(",") : [];
  
  const totalAmountParam = Number(searchParams.get("amount") || 0);
  const trainName = searchParams.get("trainName") || "Suborno Express";
  const route = "Dhaka → Chittagong"; // Ideally dynamic too
  const date = searchParams.get("date") || "Jan 15, 2025";
  const departure = searchParams.get("time") || "10:00 AM";

  const baseFare = 650;
  const totalAmount = totalAmountParam > 0 ? totalAmountParam : seatIds.length * baseFare;
  const seatFare = seatIds.length > 0 ? totalAmount / seatIds.length : baseFare;

  const gatewayUrl = searchParams.get("gatewayUrl");
  const expiresAt = searchParams.get("expiresAt");
  const bookingId = searchParams.get("bookingId");

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [currentStep] = useState(3);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (expiresAt) {
      const expiry = new Date(expiresAt).getTime();
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const diff = Math.max(0, Math.floor((expiry - now) / 1000));
        setTimeLeft(diff);
        if (diff <= 0) clearInterval(interval);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [expiresAt]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Fetch booking details on mount to get reservationId and fresh status
  useEffect(() => {
    if (bookingId) {
       axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1"}/bookings/${bookingId}`)
         .then(res => {
            const booking = res.data;
            if (booking && booking.reservationId) {
               // Update state with server data if needed, or store reservationId
               // For now, we'll just store it in a ref or state if we added one, 
               // but simpler to just fetch it or assuming we can use it in handlePayment.
               // We will use a state.
            }
         })
         .catch(err => console.error("Failed to fetch booking details", err));
    }
  }, [bookingId]);

  const handlePayment = async () => {
    if (!acceptedTerms) {
      setErrors({ terms: "You must accept the terms and conditions" });
      return;
    }

    // Always initiate a FRESH payment session to avoid "Transaction Expired" errors
    try {
      console.log("[v2] Initiating fresh payment session...");
      
      // 1. Fetch latest booking details to get reservationId
      const bookingRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1"}/bookings/${bookingId}`);
      const booking = bookingRes.data;

      if (!booking || !booking.reservationId) {
          throw new Error("Invalid booking data");
      }

      // 2. Initiate Payment
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1"}/payments/initiate`, {
        reservationId: booking.reservationId,
        bookingId: booking.id,
        userId: booking.userId,
        amount: booking.totalAmount, // Use server-side amount
        paymentMethod: "GATEWAY", 
        customerName: "Guest User", // Should ideally come from booking or user profile
        customerEmail: "user@example.com",
        customerPhone: "01700000000"
      });

      if (response.data && (response.data.gatewayUrl || response.data.gatewayPageURL)) {
          window.location.href = response.data.gatewayUrl || response.data.gatewayPageURL;
      } else {
           setErrors({ method: "Failed to get payment gateway URL" });
      }
    } catch (error: any) {
        console.error("Payment initiation failed:", error);
        setErrors({ method: error.response?.data?.message || "Payment initiation failed" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}


      {/* Progress Indicator */}
      <div className="border-b border-border bg-card/30">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center justify-center gap-2 md:gap-4">
            {[
              { step: 1, label: "Seats", icon: Users },
              { step: 2, label: "Passengers", icon: User },
              { step: 3, label: "Payment", icon: CreditCard },
              { step: 4, label: "Confirmation", icon: CheckCircle2 },
            ].map(({ step, label }, index) => (
              <div key={step} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      step < currentStep
                        ? "bg-primary text-primary-foreground"
                        : step === currentStep
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step < currentStep ? "✓" : step}
                  </div>
                  <span
                    className={`text-sm font-medium hidden md:block ${
                      step === currentStep
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {index < 3 && (
                  <div className="w-8 md:w-16 h-0.5 bg-border mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-2 overflow-hidden">
                <div className="bg-primary/5 p-6 border-b border-border flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Secure Payment</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      You will be redirected to our secure payment gateway to complete your transaction
                    </p>
                  </div>
                  {timeLeft > 0 && (
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Session Expires</span>
                      <span className="text-2xl font-mono font-bold text-primary animate-pulse">
                        {formatTime(timeLeft)}
                      </span>
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                       <CreditCard className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">SSLCommerz Hosted Checkout</h3>
                      <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-2">
                         Supports all major Credit/Debit cards, Net Banking, and Mobile Banking (bKash, Nagad, Rocket).
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4 pt-4 grayscale opacity-70">
                       {/* Mock Icons/Placeholders or dynamic ones if available */}
                       <div className="px-3 py-1 rounded border text-xs font-bold bg-muted">Visa</div>
                       <div className="px-3 py-1 rounded border text-xs font-bold bg-muted">MasterCard</div>
                       <div className="px-3 py-1 rounded border text-xs font-bold bg-muted">bKash</div>
                       <div className="px-3 py-1 rounded border text-xs font-bold bg-muted">Nagad</div>
                    </div>
                  </div>
               </CardContent>
            </Card>

            {/* Terms & Conditions */}
            <Card className="border-2">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => {
                      setAcceptedTerms(checked as boolean);
                      setErrors({ ...errors, terms: "" });
                    }}
                    className={errors.terms ? "border-red-500" : ""}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="terms"
                      className="text-sm font-normal cursor-pointer"
                    >
                      I accept the{" "}
                      <Link
                        href="/terms"
                        className="text-primary hover:underline"
                      >
                        Terms & Conditions
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        className="text-primary hover:underline"
                      >
                        Privacy Policy
                      </Link>
                    </Label>
                    {errors.terms && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.terms}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {errors.method && (
               <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {errors.method}
               </div>
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-2 sticky top-24">
              <CardContent className="p-5">
                <h3 className="font-semibold mb-4">Booking Summary</h3>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Train</span>
                    <span className="font-medium">{trainName}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Route</span>
                    <span className="font-medium">{route}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{date}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Departure</span>
                    <span className="font-medium">{departure}</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4 mb-4">
                  <h4 className="font-semibold text-sm mb-3">Selected Seats</h4>
                  <div className="space-y-2">
                    {seatNumbers.map((seatNumber, index) => (
                      <div
                        key={seatIds[index]}
                        className="flex items-center justify-between p-2 rounded bg-muted text-sm"
                      >
                        <span className="font-medium">Seat {seatNumber}</span>
                        <span>BDT {seatFare}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border pt-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      Seats ({seatIds.length})
                    </span>
                    <span className="text-sm">BDT {totalAmount}</span>
                  </div>
                  <div className="flex items-center justify-between font-semibold text-lg">
                    <span>Total Amount</span>
                    <span className="text-primary">BDT {totalAmount}</span>
                  </div>
                </div>

                <Button
                  onClick={handlePayment}
                  className="w-full bg-primary hover:bg-primary/90 h-11"
                  disabled={timeLeft <= 0 && !!expiresAt}
                >
                  {timeLeft <= 0 && !!expiresAt ? "Session Expired" : "Proceed to Secure Payment"}
                </Button>

                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground text-center">
                    🔒 SSL Secured Checkout
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentForm />
    </Suspense>
  );
}
