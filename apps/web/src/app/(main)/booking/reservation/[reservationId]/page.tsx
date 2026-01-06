"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Clock, X, CheckCircle2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Mock reservation data (in real app this will come from SEAT_RESERVATION.RESERVE)
const mockReservation = (id: string) => ({
  reservationId: id,
  bookingId: null,
  trainName: "Suborno Express",
  route: { from: "Dhaka", to: "Chittagong" },
  seats: ["A3", "A4"],
  expiresAt: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
});

export default function ReservationPage() {
  const params = useParams();
  const router = useRouter();
  const reservationId = (params.reservationId as string) || "RES123";
  const [reservation] = useState(() => mockReservation(reservationId));
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    return Math.max(
      0,
      Math.floor(
        (new Date(reservation.expiresAt).getTime() - Date.now()) / 1000
      )
    );
  });
  const [isReleasing, setIsReleasing] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const formatRemaining = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleRelease = () => {
    setIsReleasing(true);
    // Simulate API call to release reservation
    setTimeout(() => {
      setIsReleasing(false);
      router.push("/search-trains");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background">


      <div className="container mx-auto px-4 lg:px-8 py-8 max-w-3xl">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Reservation Hold
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Reservation ID
              </p>
              <div className="flex items-center gap-3">
                <code className="font-mono px-2 py-1 bg-muted rounded">
                  {reservation.reservationId}
                </code>
                <span className="text-xs text-muted-foreground">
                  Reserved seats will expire in
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Train</p>
                <p className="font-semibold">{reservation.trainName}</p>
                <p className="text-sm text-muted-foreground">
                  {reservation.route.from} → {reservation.route.to}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-muted-foreground">Time left</p>
                <p className="font-mono text-2xl font-semibold">
                  {formatRemaining(secondsLeft)}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Seats Held</p>
              <div className="flex gap-2">
                {reservation.seats.map((s) => (
                  <div
                    key={s}
                    className="px-3 py-1 bg-primary/10 border-2 border-primary rounded font-medium"
                  >
                    {s}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Link href="/booking/passengers" className="flex-1">
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Continue Booking
                </Button>
              </Link>
              <Button
                variant="outline"
                className="border-2"
                onClick={handleRelease}
                disabled={isReleasing}
              >
                {isReleasing ? "Releasing..." : "Release Reservation"}
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>
                Your seats are temporarily held for you. Complete the booking
                before the timer runs out or release the hold to make seats
                available to others.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
