"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function PaymentProcessingPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Connecting to gateway...");

  useEffect(() => {
    // Simulate payment steps
    const timers = [
      setTimeout(() => setStatus("Verifying credentials..."), 1500),
      setTimeout(() => setStatus("Processing transaction..."), 3000),
      setTimeout(() => {
        // Randomly succeed or fail for demo purposes (mostly succeed)
        const isSuccess = Math.random() > 0.1; 
        if (isSuccess) {
          router.push("/booking/confirmation/BK20251231001");
        } else {
          router.push("/booking/payment/failure");
        }
      }, 4500),
    ];

    return () => timers.forEach(clearTimeout);
  }, [router]);

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 shadow-lg">
        <CardContent className="p-12 text-center">
          <div className="relative w-20 h-20 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-muted rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-primary animate-pulse" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Processing Payment</h2>
          <p className="text-muted-foreground mb-6">
            Please do not close this window or press back
          </p>
          
          <div className="bg-muted p-3 rounded-lg text-sm font-mono text-primary animate-pulse">
            {status}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
