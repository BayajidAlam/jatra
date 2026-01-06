"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  CreditCard,
  Shield,
  Zap,
  ArrowRight,
  Train,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StationSelect } from "@/components/station-select";
import { useTrainSearch } from "@/hooks/use-train-search";

export default function HomePage() {
  const router = useRouter();
  const { useStations } = useTrainSearch();
  const { data: stations, isLoading: isLoadingStations } = useStations();

  const [fromStation, setFromStation] = useState("");
  const [toStation, setToStation] = useState("");
  const [date, setDate] = useState("");
  const [passengers, setPassengers] = useState("1");

  const handleSearch = () => {
    if (fromStation && toStation && date) {
      router.push(
        `/search-trains?from=${fromStation}&to=${toStation}&date=${date}`
      );
    } else {
      router.push("/search-trains");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Booking Form */}
      <section className="relative pt-20 pb-32">
        <div className="absolute inset-0 bg-linear-to-b from-primary/5 via-background to-background" />

        <div className="container mx-auto px-4 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm text-primary font-medium">
                Real-time seat availability
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance leading-tight">
              Book your journey
              <br />
              <span className="text-muted-foreground">in seconds.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Modern railway booking for Bangladesh. Real-time availability,
              instant confirmations, and secure payments.
            </p>
          </div>

          {/* Booking Card */}
          <Card className="max-w-5xl mx-auto shadow-2xl border-border bg-card/50 backdrop-blur-lg">
            <CardContent className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-row lg:items-end gap-4">
                <div className="lg:w-[28%] lg:shrink-0 min-w-0">
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    From
                  </label>
                  <StationSelect
                    value={fromStation}
                    onChange={setFromStation}
                    stations={stations}
                    placeholder="From Station"
                    disabled={isLoadingStations}
                    className="h-12"
                  />
                </div>

                <div className="lg:w-[28%] lg:shrink-0 min-w-0">
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    To
                  </label>
                  <StationSelect
                    value={toStation}
                    onChange={setToStation}
                    stations={stations}
                    placeholder="To Station"
                    disabled={isLoadingStations}
                    className="h-12"
                  />
                </div>

                <div className="lg:w-[28%] lg:shrink-0">
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Date
                  </label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-12"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="lg:flex-1 w-full min-w-0">
                  <Button 
                    onClick={handleSearch}
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                  >
                    Search Trains
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                50K+
              </div>
              <div className="text-sm text-muted-foreground">
                Monthly bookings
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                98%
              </div>
              <div className="text-sm text-muted-foreground">Success rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                2min
              </div>
              <div className="text-sm text-muted-foreground">
                Avg. booking time
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                24/7
              </div>
              <div className="text-sm text-muted-foreground">
                Support available
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
              Why choose Jatra Railway
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Experience the future of railway booking with modern technology
              and reliable service.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-2 hover:border-primary/50 transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Instant Confirmation
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Get your tickets confirmed instantly with real-time seat
                  allocation and digital tickets.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Real-time Tracking
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Track your train in real-time with accurate arrival and
                  departure updates.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Secure Payments</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Multiple payment options with bank-level security and
                  encrypted transactions.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Refund Protection
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Easy cancellation with instant refunds processed within 24
                  hours.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Best Price Guarantee
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Official railway prices with no hidden charges or booking
                  fees.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">24/7 Support</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Round-the-clock customer support via chat, phone, and email.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
              Popular routes
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Book the most traveled routes across Bangladesh with just a few
              clicks.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                from: "Dhaka",
                to: "Chittagong",
                duration: "5h 30m",
                trains: "12 trains/day",
              },
              {
                from: "Dhaka",
                to: "Sylhet",
                duration: "6h 15m",
                trains: "8 trains/day",
              },
              {
                from: "Dhaka",
                to: "Rajshahi",
                duration: "5h 00m",
                trains: "10 trains/day",
              },
              {
                from: "Chittagong",
                to: "Sylhet",
                duration: "8h 45m",
                trains: "6 trains/day",
              },
              {
                from: "Dhaka",
                to: "Khulna",
                duration: "7h 20m",
                trains: "7 trains/day",
              },
              {
                from: "Dhaka",
                to: "Cox's Bazar",
                duration: "9h 30m",
                trains: "4 trains/day",
              },
            ].map((route, index) => (
              <Card
                key={index}
                className="group cursor-pointer border-2 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Train className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-lg">
                          {route.from} → {route.to}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {route.trains}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{route.duration}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              className="border-2 bg-transparent"
            >
              View All Routes
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <Card className="max-w-4xl mx-auto border-2 border-primary/20 bg-linear-to-br from-primary/5 to-background">
            <CardContent className="p-12 md:p-16 text-center">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-balance">
                Ready to start your journey?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
                Join thousands of travelers who trust Jatra Railway for their
                daily commute and long-distance travel.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8"
                >
                  Book Your First Ticket
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 h-12 px-8 bg-transparent"
                >
                  Download Mobile App
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
