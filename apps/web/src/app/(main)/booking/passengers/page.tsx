"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Train, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Suspense } from "react";

interface PassengerData {
  name: string;
  age: string;
  gender: "MALE" | "FEMALE" | "OTHER" | "";
  seatId: string;
}

function PassengerForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const seatsParam = searchParams.get("seats");
  const selectedSeats = seatsParam ? seatsParam.split(",") : [];
  const totalAmount = Number(searchParams.get("amount") || 0);
  const trainName = searchParams.get("trainName") || "Suborno Express";
  const seatFare = 650; // In real app, derived from total / seats

  const [passengers, setPassengers] = useState<PassengerData[]>(
    selectedSeats.map((seatId) => ({
      name: "",
      age: "",
      gender: "",
      seatId,
    }))
  );
  const [errors, setErrors] = useState<Record<number, Record<string, string>>>(
    {}
  );
  const [currentStep] = useState(2);

  const updatePassenger = (
    index: number,
    field: keyof PassengerData,
    value: string
  ) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);

    // Clear error for this field
    if (errors[index]?.[field]) {
      const newErrors = { ...errors };
      delete newErrors[index][field];
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors: Record<number, Record<string, string>> = {};
    let hasErrors = false;

    passengers.forEach((passenger, index) => {
      const passengerErrors: Record<string, string> = {};

      if (!passenger.name.trim()) {
        passengerErrors.name = "Name is required";
        hasErrors = true;
      } else if (passenger.name.trim().length < 2) {
        passengerErrors.name = "Name must be at least 2 characters";
        hasErrors = true;
      }

      if (!passenger.age) {
        passengerErrors.age = "Age is required";
        hasErrors = true;
      } else {
        const age = Number.parseInt(passenger.age);
        if (isNaN(age) || age < 1 || age > 120) {
          passengerErrors.age = "Age must be between 1 and 120";
          hasErrors = true;
        }
      }

      if (!passenger.gender) {
        passengerErrors.gender = "Gender is required";
        hasErrors = true;
      }

      if (Object.keys(passengerErrors).length > 0) {
        newErrors[index] = passengerErrors;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleContinue = () => {
    if (validateForm()) {
      console.log("[v0] Passenger data validated:", passengers);
      router.push("/booking/payment");
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
              { step: 1, label: "Seats" },
              { step: 2, label: "Passengers" },
              { step: 3, label: "Payment" },
              { step: 4, label: "Confirmation" },
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
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Passenger Details</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Please enter passenger information for each selected seat
            </p>

            <div className="space-y-4">
              {passengers.map((passenger, index) => (
                <Card key={passenger.seatId} className="border-2">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">
                        Passenger {index + 1} - Seat {passenger.seatId}
                      </h3>
                      <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary font-medium">
                        {passenger.seatId}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      {/* Name */}
                      <div className="md:col-span-2">
                        <Label htmlFor={`name-${index}`}>Full Name *</Label>
                        <Input
                          id={`name-${index}`}
                          placeholder="Enter full name"
                          value={passenger.name}
                          onChange={(e) =>
                            updatePassenger(index, "name", e.target.value)
                          }
                          className={
                            errors[index]?.name ? "border-red-500" : ""
                          }
                        />
                        {errors[index]?.name && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors[index].name}
                          </p>
                        )}
                      </div>

                      {/* Age */}
                      <div>
                        <Label htmlFor={`age-${index}`}>Age *</Label>
                        <Input
                          id={`age-${index}`}
                          type="number"
                          placeholder="Age"
                          min="1"
                          max="120"
                          value={passenger.age}
                          onChange={(e) =>
                            updatePassenger(index, "age", e.target.value)
                          }
                          className={errors[index]?.age ? "border-red-500" : ""}
                        />
                        {errors[index]?.age && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors[index].age}
                          </p>
                        )}
                      </div>

                      {/* Gender */}
                      <div className="md:col-span-3">
                        <Label htmlFor={`gender-${index}`}>Gender *</Label>
                        <select
                          id={`gender-${index}`}
                          value={passenger.gender}
                          onChange={(e) =>
                            updatePassenger(
                              index,
                              "gender",
                              e.target.value as "MALE" | "FEMALE" | "OTHER"
                            )
                          }
                          className={`h-10 w-full px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                            errors[index]?.gender ? "border-red-500" : ""
                          }`}
                        >
                          <option value="">Select gender</option>
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other</option>
                        </select>
                        {errors[index]?.gender && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors[index].gender}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-2 sticky top-24">
              <CardContent className="p-5">
                <h3 className="font-semibold mb-4">Booking Summary</h3>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Train</span>
                    <span className="font-medium">Suborno Express</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Route</span>
                    <span className="font-medium">Dhaka → Chittagong</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">Jan 15, 2025</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Departure</span>
                    <span className="font-medium">10:00 AM</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4 mb-4">
                  <h4 className="font-semibold text-sm mb-3">Selected Seats</h4>
                  <div className="space-y-2">
                    {selectedSeats.map((seatId) => (
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
                      Seats ({selectedSeats.length})
                    </span>
                    <span className="text-sm">BDT {totalAmount}</span>
                  </div>
                  <div className="flex items-center justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-primary">BDT {totalAmount}</span>
                  </div>
                </div>

                <Button
                  onClick={handleContinue}
                  className="w-full bg-primary hover:bg-primary/90 h-11"
                >
                  Continue to Payment
                  <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-3">
                  All fields marked with * are required
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PassengerDetailsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PassengerForm />
    </Suspense>
  );
}
