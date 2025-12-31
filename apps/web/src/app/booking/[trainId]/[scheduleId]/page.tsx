"use client";

import { useState } from "react";
import Link from "next/link";
import { Train, ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Mock data
const coachOptions = [
  {
    id: "AC_CHAIR",
    name: "AC Chair",
    availableSeats: 45,
    priceRange: "BDT 650-850",
  },
  {
    id: "AC_BERTH",
    name: "AC Berth",
    availableSeats: 28,
    priceRange: "BDT 900-1250",
  },
  {
    id: "SNIGDHA",
    name: "Snigdha",
    availableSeats: 52,
    priceRange: "BDT 450-600",
  },
  {
    id: "SHOVAN",
    name: "Shovan",
    availableSeats: 64,
    priceRange: "BDT 300-420",
  },
];

const generateSeats = () => {
  const seats = [];
  const rows = ["A", "B", "C", "D", "E", "F"];
  const bookedSeats = ["A2", "A5", "B3", "C1", "C6", "D4", "E2", "F5"];

  for (const row of rows) {
    for (let i = 1; i <= 10; i++) {
      const seatNumber = `${row}${i}`;
      seats.push({
        seatId: seatNumber,
        seatNumber,
        status: bookedSeats.includes(seatNumber) ? "BOOKED" : "AVAILABLE",
        fare: 650,
        seatType: i === 1 || i === 10 ? "WINDOW" : i === 5 ? "AISLE" : "MIDDLE",
      });
    }
  }
  return seats;
};

export default function SeatSelectionPage() {
  const [selectedCoach, setSelectedCoach] = useState("AC_CHAIR");
  const [seats] = useState(generateSeats());
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const handleSeatClick = (seatId: string, status: string) => {
    if (status === "BOOKED") return;

    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    );
  };

  const totalAmount = selectedSeats.length * 650;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/search-trains">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Train className="h-5 w-5 text-primary" />
                <span className="font-semibold">Suborno Express</span>
                <span className="text-sm text-muted-foreground">
                  • Dhaka → Chittagong
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Select Your Seats</h2>

            {/* Coach Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
              {coachOptions.map((coach) => (
                <button
                  key={coach.id}
                  onClick={() => setSelectedCoach(coach.id)}
                  className={cn(
                    "px-4 py-3 rounded-lg border-2 transition-all whitespace-nowrap shrink-0",
                    selectedCoach === coach.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="font-semibold">{coach.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {coach.availableSeats} available
                  </div>
                </button>
              ))}
            </div>

            {/* Seat Map */}
            <Card className="border-2">
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-center gap-6 text-sm mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-green-500/20 border-2 border-green-500" />
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-primary/20 border-2 border-primary" />
                      <span>Selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-red-500/20 border-2 border-red-500" />
                      <span>Booked</span>
                    </div>
                  </div>
                </div>

                {/* Seat Grid */}
                <div className="space-y-3">
                  {["A", "B", "C", "D", "E", "F"].map((row) => (
                    <div key={row} className="flex items-center gap-2">
                      <span className="w-6 text-sm font-medium text-muted-foreground">
                        {row}
                      </span>
                      <div className="flex gap-2 flex-1">
                        {Array.from({ length: 10 }).map((_, i) => {
                          const seatNumber = `${row}${i + 1}`;
                          const seat = seats.find(
                            (s) => s.seatNumber === seatNumber
                          );
                          const isSelected = selectedSeats.includes(seatNumber);
                          const isBooked = seat?.status === "BOOKED";

                          return (
                            <button
                              key={seatNumber}
                              onClick={() =>
                                handleSeatClick(
                                  seatNumber,
                                  seat?.status || "AVAILABLE"
                                )
                              }
                              disabled={isBooked}
                              className={cn(
                                "w-9 h-9 rounded text-xs font-medium border-2 transition-all",
                                isBooked &&
                                  "bg-red-500/20 border-red-500 text-red-700 dark:text-red-400 cursor-not-allowed",
                                isSelected &&
                                  "bg-primary/20 border-primary text-primary",
                                !isBooked &&
                                  !isSelected &&
                                  "bg-green-500/20 border-green-500 text-green-700 dark:text-green-400 hover:border-primary"
                              )}
                            >
                              {i + 1}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Selection Summary */}
          <div className="lg:col-span-1">
            <Card className="border-2 sticky top-24">
              <CardContent className="p-5">
                <h3 className="font-semibold mb-4">Selected Seats</h3>

                {selectedSeats.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No seats selected yet. Click on available seats to select.
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                      {selectedSeats.map((seatId) => (
                        <div
                          key={seatId}
                          className="flex items-center justify-between p-2 rounded bg-muted"
                        >
                          <span className="font-medium text-sm">
                            Seat {seatId}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">BDT 650</span>
                            <button
                              onClick={() =>
                                handleSeatClick(seatId, "AVAILABLE")
                              }
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
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

                    <Button className="w-full bg-primary hover:bg-primary/90 h-11">
                      <Link
                        href="/booking/passengers"
                        className="flex items-center justify-center w-full"
                      >
                        Continue to Passengers
                        <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                      </Link>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
