"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import Header from "@/components/layout/Header";

type PaymentMethod = "BKASH" | "NAGAD" | "CARD" | "ROCKET" | null;

function PaymentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Dynamic booking data from URL
  const seatsParam = searchParams.get("seats");
  const seats = seatsParam ? seatsParam.split(",") : [];
  const totalAmount = Number(searchParams.get("amount") || 0);
  const trainName = searchParams.get("trainName") || "Suborno Express";
  const route = "Dhaka → Chittagong"; // Ideally dynamic too
  const date = searchParams.get("date") || "Jan 15, 2025";
  const departure = searchParams.get("time") || "10:00 AM";
  const seatFare = seats.length > 0 ? totalAmount / seats.length : 650;

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [currentStep] = useState(3);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Payment form states
  const [bkashNumber, setBkashNumber] = useState("");
  const [nagadNumber, setNagadNumber] = useState("");
  const [rocketNumber, setRocketNumber] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVV, setCardCVV] = useState("");
  const [cardName, setCardName] = useState("");

  const paymentMethods = [
    {
      id: "BKASH" as PaymentMethod,
      name: "bKash",
      description: "Pay with bKash mobile wallet",
      icon: Smartphone,
      color: "text-pink-600",
    },
    {
      id: "NAGAD" as PaymentMethod,
      name: "Nagad",
      description: "Pay with Nagad mobile wallet",
      icon: Smartphone,
      color: "text-orange-600",
    },
    {
      id: "CARD" as PaymentMethod,
      name: "Credit/Debit Card",
      description: "Visa, Mastercard, Amex",
      icon: CreditCard,
      color: "text-blue-600",
    },
    {
      id: "ROCKET" as PaymentMethod,
      name: "Rocket",
      description: "Pay with Rocket mobile wallet",
      icon: Smartphone,
      color: "text-purple-600",
    },
  ];

  const validatePayment = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedMethod) {
      newErrors.method = "Please select a payment method";
    }

    if (selectedMethod === "BKASH") {
      if (!bkashNumber) {
        newErrors.bkashNumber = "bKash number is required";
      } else if (!/^01[3-9]\d{8}$/.test(bkashNumber)) {
        newErrors.bkashNumber = "Invalid bKash number format";
      }
    }

    if (selectedMethod === "NAGAD") {
      if (!nagadNumber) {
        newErrors.nagadNumber = "Nagad number is required";
      } else if (!/^01[3-9]\d{8}$/.test(nagadNumber)) {
        newErrors.nagadNumber = "Invalid Nagad number format";
      }
    }

    if (selectedMethod === "ROCKET") {
      if (!rocketNumber) {
        newErrors.rocketNumber = "Rocket number is required";
      } else if (!/^01[3-9]\d{8}$/.test(rocketNumber)) {
        newErrors.rocketNumber = "Invalid Rocket number format";
      }
    }

    if (selectedMethod === "CARD") {
      if (!cardNumber) {
        newErrors.cardNumber = "Card number is required";
      } else if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ""))) {
        newErrors.cardNumber = "Invalid card number";
      }

      if (!cardExpiry) {
        newErrors.cardExpiry = "Expiry date is required";
      } else if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        newErrors.cardExpiry = "Invalid format (MM/YY)";
      }

      if (!cardCVV) {
        newErrors.cardCVV = "CVV is required";
      } else if (!/^\d{3,4}$/.test(cardCVV)) {
        newErrors.cardCVV = "Invalid CVV";
      }

      if (!cardName) {
        newErrors.cardName = "Cardholder name is required";
      }
    }

    if (!acceptedTerms) {
      newErrors.terms = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = () => {
    if (validatePayment()) {
      console.log("[v0] Payment processing:", { selectedMethod, totalAmount });
      // Navigate to booking confirmation with query params roughly passed along or just the booking ID
      router.push("/booking/confirmation/BK20251231001");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

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
            <div>
              <h2 className="text-2xl font-bold mb-2">Payment Method</h2>
              <p className="text-sm text-muted-foreground">
                Select your preferred payment method to complete booking
              </p>
            </div>

            {/* Payment Method Selection */}
            <div className="grid sm:grid-cols-2 gap-4">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <Card
                    key={method.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedMethod === method.id
                        ? "border-2 border-primary"
                        : "border-2 border-transparent"
                    }`}
                    onClick={() => {
                      setSelectedMethod(method.id);
                      setErrors({ ...errors, method: "" });
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-lg bg-muted ${method.color}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">
                            {method.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {method.description}
                          </p>
                        </div>
                        {selectedMethod === method.id && (
                          <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            {errors.method && (
              <p className="text-sm text-red-500">{errors.method}</p>
            )}

            {/* Payment Forms */}
            {selectedMethod === "BKASH" && (
              <Card className="border-2">
                <CardContent className="p-5">
                  <h3 className="font-semibold mb-4">bKash Payment Details</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="bkashNumber">
                        bKash Account Number *
                      </Label>
                      <Input
                        id="bkashNumber"
                        placeholder="01XXXXXXXXX"
                        value={bkashNumber}
                        onChange={(e) => {
                          setBkashNumber(e.target.value);
                          setErrors({ ...errors, bkashNumber: "" });
                        }}
                        className={errors.bkashNumber ? "border-red-500" : ""}
                      />
                      {errors.bkashNumber && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.bkashNumber}
                        </p>
                      )}
                    </div>
                    <div className="bg-muted p-3 rounded-lg text-sm">
                      <p className="text-muted-foreground">
                        You will receive a payment request on your bKash app.
                        Please approve it to complete the booking.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedMethod === "NAGAD" && (
              <Card className="border-2">
                <CardContent className="p-5">
                  <h3 className="font-semibold mb-4">Nagad Payment Details</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nagadNumber">
                        Nagad Account Number *
                      </Label>
                      <Input
                        id="nagadNumber"
                        placeholder="01XXXXXXXXX"
                        value={nagadNumber}
                        onChange={(e) => {
                          setNagadNumber(e.target.value);
                          setErrors({ ...errors, nagadNumber: "" });
                        }}
                        className={errors.nagadNumber ? "border-red-500" : ""}
                      />
                      {errors.nagadNumber && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.nagadNumber}
                        </p>
                      )}
                    </div>
                    <div className="bg-muted p-3 rounded-lg text-sm">
                      <p className="text-muted-foreground">
                        You will be redirected to Nagad payment gateway to
                        complete the transaction.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedMethod === "ROCKET" && (
              <Card className="border-2">
                <CardContent className="p-5">
                  <h3 className="font-semibold mb-4">Rocket Payment Details</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="rocketNumber">
                        Rocket Account Number *
                      </Label>
                      <Input
                        id="rocketNumber"
                        placeholder="01XXXXXXXXX"
                        value={rocketNumber}
                        onChange={(e) => {
                          setRocketNumber(e.target.value);
                          setErrors({ ...errors, rocketNumber: "" });
                        }}
                        className={errors.rocketNumber ? "border-red-500" : ""}
                      />
                      {errors.rocketNumber && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.rocketNumber}
                        </p>
                      )}
                    </div>
                    <div className="bg-muted p-3 rounded-lg text-sm">
                      <p className="text-muted-foreground">
                        You will receive a payment request on your Rocket
                        account. Please approve it to complete.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedMethod === "CARD" && (
              <Card className="border-2">
                <CardContent className="p-5">
                  <h3 className="font-semibold mb-4">Card Payment Details</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cardNumber">Card Number *</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) => {
                          setCardNumber(e.target.value);
                          setErrors({ ...errors, cardNumber: "" });
                        }}
                        className={errors.cardNumber ? "border-red-500" : ""}
                      />
                      {errors.cardNumber && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.cardNumber}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cardExpiry">Expiry Date *</Label>
                        <Input
                          id="cardExpiry"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => {
                            setCardExpiry(e.target.value);
                            setErrors({ ...errors, cardExpiry: "" });
                          }}
                          className={errors.cardExpiry ? "border-red-500" : ""}
                        />
                        {errors.cardExpiry && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.cardExpiry}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="cardCVV">CVV *</Label>
                        <Input
                          id="cardCVV"
                          placeholder="123"
                          type="password"
                          maxLength={4}
                          value={cardCVV}
                          onChange={(e) => {
                            setCardCVV(e.target.value);
                            setErrors({ ...errors, cardCVV: "" });
                          }}
                          className={errors.cardCVV ? "border-red-500" : ""}
                        />
                        {errors.cardCVV && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.cardCVV}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="cardName">Cardholder Name *</Label>
                      <Input
                        id="cardName"
                        placeholder="Name on card"
                        value={cardName}
                        onChange={(e) => {
                          setCardName(e.target.value);
                          setErrors({ ...errors, cardName: "" });
                        }}
                        className={errors.cardName ? "border-red-500" : ""}
                      />
                      {errors.cardName && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.cardName}
                        </p>
                      )}
                    </div>
                    <div className="bg-muted p-3 rounded-lg text-sm flex items-start gap-2">
                      <div className="text-primary mt-0.5">🔒</div>
                      <p className="text-muted-foreground">
                        Your card details are encrypted and secure. We never
                        store your complete card information.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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
                    {seats.map((seatId) => (
                      <div
                        key={seatId}
                        className="flex items-center justify-between p-2 rounded bg-muted text-sm"
                      >
                        <span className="font-medium">Seat {seatId}</span>
                        <span>BDT {seatFare}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border pt-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      Seats ({seats.length})
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
                >
                  Pay Now - BDT {totalAmount}
                </Button>

                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground text-center">
                    🔒 Your payment is secure and encrypted
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
