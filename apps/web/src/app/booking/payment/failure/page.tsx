"use client";

import Link from "next/link";
import { AlertCircle, RotateCcw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export default function PaymentFailurePage() {
  return (
    <div className="min-h-screen bg-red-50/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-red-100 shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-red-900">Payment Failed</h2>
          <p className="text-red-600/80">
            We couldn't process your transaction
          </p>
        </CardHeader>
        
        <CardContent className="text-center pt-2">
          <p className="text-sm text-gray-600 mb-6">
            This could be due to insufficient funds, network issues, or a timeout from your bank. No money has been deducted from your account.
          </p>
          
          <div className="bg-red-50 p-3 rounded-lg text-sm text-red-800 font-mono text-left mb-4">
            Error Code: PAY_ERR_TIMEOUT
            <br />
            Transaction ID: TXN_FAILED_8392
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Link href="/booking/payment" className="w-full">
            <Button className="w-full bg-red-600 hover:bg-red-700 h-11">
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </Link>
          <Link href="/booking/payment" className="w-full">
            <Button variant="outline" className="w-full border-red-200 text-red-700 hover:bg-red-50 h-11">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Choose Another Method
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
