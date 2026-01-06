"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const errorMessage = searchParams.get("error") || "Payment failed";
  const transactionId = searchParams.get("tran_id");
  const bookingId = searchParams.get("bookingId");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-red-500 border-t-4">
            <CardHeader className="text-center">
                <div className="mx-auto bg-red-100 p-3 rounded-full w-fit mb-4">
                    <XCircle className="h-10 w-10 text-red-600" />
                </div>
                <CardTitle className="text-2xl text-red-700">Payment Failed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
                <p className="text-muted-foreground">
                    We could not process your payment.
                </p>
                
                <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
                    {errorMessage}
                </div>

                {transactionId && (
                     <p className="text-xs text-muted-foreground">Transaction ID: {transactionId}</p>
                )}

                <div className="space-y-3">
                    <Button onClick={() => router.push(`/booking/${bookingId || ""}`)} className="w-full">
                        <RefreshCw className="mr-2 h-4 w-4" /> Try Again
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

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentFailedContent />
    </Suspense>
  );
}
