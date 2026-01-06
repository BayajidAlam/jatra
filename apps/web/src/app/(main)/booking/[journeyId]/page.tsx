"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Train, ArrowLeft, X, Loader2, MapPin } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

interface Seat {
  id: string; // UUID
  seatNumber: string;
  coachId: string;
  baseFare: number;
  status: "AVAILABLE" | "BOOKED" | "LOCKED";
}

interface Coach {
  id: string;
  name: string;
  availableSeats: number;
  priceRange: string;
}

export default function SeatSelectionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const journeyId = params.journeyId as string;
  const fromStationId = searchParams.get("fromStationId");
  const toStationId = searchParams.get("toStationId");
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]); // Store UUIDs
  const [coachOptions, setCoachOptions] = useState<Coach[]>([]);
  const [selectedCoach, setSelectedCoach] = useState<string>("");

  useEffect(() => {
    const fetchSeats = async () => {
      if (!fromStationId || !toStationId) {
        toast({
          title: "Error",
          description: "Missing station information. Please select stations first.",
          variant: "destructive"
        });
        setIsLoading(false); // Fix: Clear loading state
        return;
      }

      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}/locks/availability/${journeyId}`,
          {
            params: { fromStationId, toStationId },
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (response.data?.seats && response.data.seats.length > 0) {
          const allSeats: Seat[] = response.data.seats;
          setSeats(allSeats);
          
          const uniqueCoachIds = Array.from(new Set(allSeats.map(s => s.coachId)));
          const coaches = uniqueCoachIds.map((cId, index) => ({
            id: cId,
            name: `Coach ${String.fromCharCode(65 + index)}`,
            availableSeats: allSeats.filter(s => s.coachId === cId && s.status === "AVAILABLE").length,
            priceRange: `BDT ${allSeats.find(s => s.coachId === cId)?.baseFare || 0}`
          }));
          
          setCoachOptions(coaches);
          if (coaches.length > 0 && !selectedCoach) {
            setSelectedCoach(coaches[0].id);
          }
        } else {
          setSeats([]);
          setCoachOptions([]);
          toast({
            title: "No Seats Found",
            description: "No seats are available for this journey and station combination.",
            variant: "destructive"
          });
        }
      } catch (error: any) {
        console.error("Failed to fetch seats:", error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to load seat map. Please check your connection.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeats();

    // Auto-refresh seat availability every 10 seconds to show real-time updates
    const intervalId = setInterval(() => {
      fetchSeats();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [journeyId, fromStationId, toStationId, toast]);

  const handleSeatClick = (seat: Seat) => {
    if (seat.status !== "AVAILABLE") return;

    setSelectedSeats((prev) => {
      if (prev.includes(seat.id)) {
        return prev.filter((id) => id !== seat.id);
      }
      if (prev.length >= 4) {
        toast({
          title: "Error",
          description: "You can maintain a maximum of 4 seats",
          variant: "destructive"
        });
        return prev;
      }
      return [...prev, seat.id];
    });
  };

  const getSeatDisplay = (seatId: string) => {
    return seats.find(s => s.id === seatId);
  };

  const currentCoachSeats = seats.filter(s => s.coachId === selectedCoach);
  const totalAmount = selectedSeats.reduce((sum, id) => sum + (getSeatDisplay(id)?.baseFare || 0), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const rows: Seat[][] = [];
  for (let i = 0; i < currentCoachSeats.length; i += 4) {
    rows.push(currentCoachSeats.slice(i, i + 4));
  }

  return (
    <div className="min-h-screen bg-background">
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
                <span className="font-semibold">Seat Selection</span>
                <span className="text-sm text-muted-foreground">
                  • {fromStationId && "Dhaka"} → {toStationId && "Chittagong"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Select Your Seats</h2>

            {!fromStationId || !toStationId ? (
              <div className="flex flex-col items-center justify-center p-12 bg-muted/50 rounded-2xl border-2 border-dashed border-border group hover:border-primary/50 transition-colors">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <MapPin className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">Stations Not Selected</h3>
                <p className="text-muted-foreground text-center max-w-xs mb-6">
                  Please select your departure and destination stations from the search page to view seat availability.
                </p>
                <Link href="/search-trains">
                  <Button variant="outline">
                    Back to Search
                  </Button>
                </Link>
              </div>
            ) : coachOptions.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 bg-muted/50 rounded-2xl border-2 border-dashed border-border group hover:border-primary/50 transition-colors">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Train className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">No Seats Available</h3>
                <p className="text-muted-foreground text-center max-w-xs mb-6">
                  We couldn't find any seats for this journey. Please try another coach or station combination.
                </p>
                <Link href="/search-trains">
                  <Button variant="outline">
                    Back to Search
                  </Button>
                </Link>
              </div>
            ) : (
              <>
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

                    <div className="space-y-3 flex flex-col items-center">
                      <div className="w-full max-w-sm border-x-4 border-slate-200 dark:border-slate-800 px-4 py-8 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl relative">
                        
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-200 dark:bg-slate-800 px-4 py-1 rounded-t-lg text-xs font-mono text-muted-foreground">
                          ENGINE
                        </div>

                        {rows.map((row, rowIndex) => (
                          <div key={rowIndex} className="flex items-center justify-between mb-3">
                            <div className="flex gap-2">
                              {row.slice(0, 2).map((seat) => (
                                <SeatButton 
                                  key={seat.id} 
                                  seat={seat} 
                                  isSelected={selectedSeats.includes(seat.id)}
                                  onClick={() => handleSeatClick(seat)} 
                                />
                              ))}
                            </div>
                            
                            <div className="w-8 text-center text-xs text-muted-foreground/30 font-mono">
                              {rowIndex + 1}
                            </div>

                            <div className="flex gap-2">
                               {row.slice(2, 4).map((seat) => (
                                 <SeatButton 
                                   key={seat.id} 
                                   seat={seat} 
                                   isSelected={selectedSeats.includes(seat.id)}
                                   onClick={() => handleSeatClick(seat)} 
                                 />
                               ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card className="border-2 sticky top-24">
              <CardContent className="p-5">
                <h3 className="font-semibold mb-4">Selected Seats ({selectedSeats.length})</h3>

                {selectedSeats.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No seats selected yet.
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                      {selectedSeats.map((seatId) => {
                        const seat = getSeatDisplay(seatId);
                        if (!seat) return null;
                        return (
                          <div
                            key={seatId}
                            className="flex items-center justify-between p-2 rounded bg-muted"
                          >
                            <span className="font-medium text-sm">
                              Seat {seat.seatNumber}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">BDT {seat.baseFare}</span>
                              <button
                                onClick={() => handleSeatClick(seat)}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="border-t border-border pt-4 mb-4">
                      <div className="flex items-center justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span className="text-primary">BDT {totalAmount}</span>
                      </div>
                    </div>

                    <Link
                      href={{
                        pathname: "/booking/passengers",
                        query: {
                          seatIds: selectedSeats.join(","),
                          seatNumbers: selectedSeats.map(id => getSeatDisplay(id)?.seatNumber).join(","),
                          amount: totalAmount,
                          trainName: "Suborno Express",
                          trainNumber: "701",
                          time: "10:00 AM",
                          date: "Jan 15, 2025",
                          journeyId: journeyId,
                          fromStationId: fromStationId,
                          toStationId: toStationId
                        }
                      }}
                      className={cn(buttonVariants({ size: "lg" }), "w-full")}
                    >
                      Continue to Passengers
                      <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                    </Link>
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

function SeatButton({ seat, isSelected, onClick }: { seat: Seat; isSelected: boolean; onClick: () => void }) {
  const isBooked = seat.status === "BOOKED";
  const isLocked = seat.status === "LOCKED";
  const isUnavailable = isBooked || isLocked;
  
  return (
    <button
      onClick={onClick}
      disabled={isUnavailable}
      className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm transition-all",
        isBooked
          ? "bg-red-500/20 border-2 border-red-500 text-red-700 cursor-not-allowed"
          : isLocked
          ? "bg-yellow-500/20 border-2 border-yellow-500 text-yellow-700 cursor-not-allowed"
          : isSelected
          ? "bg-primary text-primary-foreground shadow-md scale-105 ring-2 ring-primary ring-offset-2"
          : "bg-green-500/20 border-2 border-green-500 text-green-700 hover:bg-green-500/30 hover:scale-105"
      )}
    >
      {seat.seatNumber}
    </button>
  );
}
