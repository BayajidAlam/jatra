"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import axios from "axios";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const bookingId = searchParams.get("bookingId");
  const paymentId = searchParams.get("paymentId");
  const transactionId = searchParams.get("tran_id");
  const valId = searchParams.get("val_id");

  const [status, setStatus] = useState<"PROCESSING" | "SUCCESS" | "ERROR">("PROCESSING");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const confirmBooking = async () => {
      if (!bookingId || !paymentId || !transactionId) {
        setStatus("ERROR");
        setErrorMessage("Missing payment details");
        return;
      }

      try {
        // Call Booking Service Confirm Endpoint
        // This orchestrates confirmation of Payment and Reservation
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}/bookings/${bookingId}/confirm`, {
          paymentId,
          transactionId,
        });

        setStatus("SUCCESS");
        // Invalidate queries to refresh booking data
        queryClient.invalidateQueries({ queryKey: ["bookings"] });
        queryClient.invalidateQueries({ queryKey: ["booking", bookingId] });
      } catch (error: any) {
        console.error("Booking confirmation failed:", error);
        setStatus("ERROR");
        setErrorMessage(error.response?.data?.message || "Failed to confirm booking");
      }
    };

    confirmBooking();
  }, [bookingId, paymentId, transactionId, valId, queryClient]);

  if (status === "PROCESSING") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
            <CardContent className="pt-10 pb-10 space-y-4">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <h2 className="text-xl font-semibold">Processing Payment...</h2>
                <p className="text-muted-foreground">Please wait while we confirm your booking.</p>
            </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "ERROR") {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-destructive flex items-center gap-2">
                        <AlertCircle className="h-6 w-6" />
                        Payment Confirmed but Booking Failed
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert variant="destructive">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                    <p className="text-sm text-muted-foreground">
                        Your payment might have been charged. If so, it will be refunded automatically. 
                        Please contact support with Transaction ID: <span className="font-mono font-bold">{transactionId}</span>
                    </p>
                    <Button onClick={() => router.push("/")} className="w-full">
                        Return to Home
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-green-500 border-t-4">
            <CardHeader className="text-center">
                <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-4">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-green-700">Booking Confirmed!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
                <p className="text-muted-foreground">
                    Your payment was successful and your seat has been booked.
                </p>
                
                <div className="bg-muted p-4 rounded-lg text-left text-sm space-y-2">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Booking ID</span>
                        <span className="font-mono">{bookingId?.substring(0, 8)}...</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Transaction ID</span>
                        <span className="font-mono">{transactionId}</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <Button onClick={() => router.push(`/booking/confirmation/${bookingId}`)} className="w-full bg-green-600 hover:bg-green-700">
                        View Ticket
                    </Button>
                    <Button variant="outline" onClick={() => router.push("/")} className="w-full">
                        Go Home
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
