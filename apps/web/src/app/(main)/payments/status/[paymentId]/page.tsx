"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// This page simulates polling PAYMENT.STATUS and shows result
export default function PaymentStatusPage() {
  const params = useParams();
  const router = useRouter();
  const paymentId = (params.paymentId as string) || "PAY123";
  const [status, setStatus] = useState<"PENDING" | "SUCCESS" | "FAILED">(
    "PENDING"
  );
  const [isPolling, setIsPolling] = useState(true);

  useEffect(() => {
    // Simulate polling: after 3s succeed, or randomly fail
    const timer = setTimeout(() => {
      const ok = Math.random() > 0.15; // 85% succeed
      setStatus(ok ? "SUCCESS" : "FAILED");
      setIsPolling(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [paymentId]);

  const handleContinue = () => {
    // In real flow we'd query PAYMENT.STATUS and route accordingly
    router.push("/my-bookings");
  };

  return (
    <div className="min-h-screen bg-background">


      <div className="container mx-auto px-4 lg:px-8 py-8 max-w-3xl">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-base">Payment Status</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              {isPolling && (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Processing payment...
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Payment ID: <code className="font-mono">{paymentId}</code>
                  </p>
                </div>
              )}

              {!isPolling && status === "SUCCESS" && (
                <div className="flex flex-col items-center gap-3">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                  <h3 className="text-lg font-semibold">Payment Successful</h3>
                  <p className="text-sm text-muted-foreground">
                    Your payment was completed successfully.
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={handleContinue} className="bg-primary">
                      View My Bookings
                    </Button>
                    <Link href="/">
                      <Button variant="outline" className="border-2">
                        Back Home
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {!isPolling && status === "FAILED" && (
                <div className="flex flex-col items-center gap-3">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                  <h3 className="text-lg font-semibold">Payment Failed</h3>
                  <p className="text-sm text-muted-foreground">
                    There was an issue processing your payment. Please try again
                    or contact support.
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Link href="/booking/payment">
                      <Button className="bg-primary">Retry Payment</Button>
                    </Link>
                    <Link href="/support">
                      <Button variant="outline" className="border-2">
                        Contact Support
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
