"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function MockGatewayContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const trx = searchParams.get("trx");
  const amount = searchParams.get("amount");
  const bookingId = searchParams.get("bookingId");
  const paymentId = searchParams.get("paymentId");

  // These should match the URLs configured in Backend PaymentService
  const successUrl = "/payment/success"; 
  const failUrl = "/payment/failed";

  const handleSuccess = () => {
    // Determine the actual redirect URL based on params or hardcoded logic
    // In real SSLCommerz, the backend provides the successUrl during init, 
    // and SSLCommerz redirects browser there with POST data.
    // Here we simulate GET redirect
    window.location.href = `${successUrl}?val_id=VALID_ID&tran_id=${trx}&amount=${amount}&card_type=VISA&store_amount=${amount}&currency=BDT&status=VALID&bookingId=${bookingId}&paymentId=${paymentId}`;
  };

  const handleFail = () => {
    window.location.href = `${failUrl}?status=FAILED&tran_id=${trx}&bookingId=${bookingId}&paymentId=${paymentId}&error=User cancelled`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-green-600">
        <CardHeader className="text-center border-b pb-4">
          <div className="flex justify-center mb-2">
            <img src="https://securepay.sslcommerz.com/gw/images/sslcommerz_logo.png" alt="SSLCommerz" className="h-12" onError={(e) => e.currentTarget.style.display='none'}/>
            {/* Fallback text if image fails */}
            <h2 className="text-2xl font-bold text-green-700">SSLCOMMERZ</h2>
          </div>
          <CardTitle>Payment Gateway (Mock)</CardTitle>
          <p className="text-sm text-gray-500">Secure Payment Channel</p>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="bg-white p-4 rounded border">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Transaction ID</span>
              <span className="font-mono font-bold">{trx || "N/A"}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Amount</span>
              <span className="font-bold text-lg">BDT {amount || "0.00"}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Merchant</span>
              <span>Jatra Railway</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
                className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg font-semibold"
                onClick={handleSuccess}
            >
              PAY NOW (Success)
            </Button>
            <Button 
                variant="destructive"
                className="w-full h-12"
                onClick={handleFail}
            >
              CANCEL (Fail)
            </Button>
          </div>
          
          <div className="text-center text-xs text-gray-400 mt-4">
             This is a mock page for testing purposes.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function MockSSLCommerzPage() {
  return (
    <Suspense fallback={<div>Loading Gateway...</div>}>
      <MockGatewayContent />
    </Suspense>
  );
}
