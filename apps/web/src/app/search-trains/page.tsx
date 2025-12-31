"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Train,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  Filter,
  Users,
} from "lucide-react";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Mock data
const stations = [
  { id: "DHK", name: "Dhaka", city: "Dhaka" },
  { id: "CTG", name: "Chittagong", city: "Chittagong" },
  { id: "SYL", name: "Sylhet", city: "Sylhet" },
  { id: "RAJ", name: "Rajshahi", city: "Rajshahi" },
  { id: "KHL", name: "Khulna", city: "Khulna" },
];

const coachTypes = ["All", "AC Chair", "AC Berth", "Snigdha", "Shovan"];

const mockTrains = [
  {
    trainId: "1",
    trainNumber: "SUBORNO-EXPRESS-701",
    trainName: "Suborno Express",
    departureTime: "06:30",
    arrivalTime: "12:45",
    duration: "6h 15m",
    availableSeats: 45,
    minFare: 450,
    maxFare: 1250,
  },
  {
    trainId: "2",
    trainNumber: "TURNA-NISHITHA-727",
    trainName: "Turna Nishitha",
    departureTime: "08:00",
    arrivalTime: "14:20",
    duration: "6h 20m",
    availableSeats: 32,
    minFare: 500,
    maxFare: 1300,
  },
  {
    trainId: "3",
    trainNumber: "MOHANAGAR-711",
    trainName: "Mohanagar Godhuli",
    departureTime: "15:30",
    arrivalTime: "21:45",
    duration: "6h 15m",
    availableSeats: 58,
    minFare: 420,
    maxFare: 1180,
  },
];

export default function SearchTrainsPage() {
  const [fromStation, setFromStation] = useState("DHK");
  const [toStation, setToStation] = useState("CTG");
  const [journeyDate, setJourneyDate] = useState("");
  const [coachType, setCoachType] = useState("All");
  const [searchResults, setSearchResults] = useState(mockTrains);

  const handleSearch = () => {
    // Simulate search
    setSearchResults(mockTrains);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 lg:px-8 py-8">
        {/* Search Form */}
        <Card className="mb-8 border-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Train className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Find Your Train</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  From Station
                </label>
                <select
                  value={fromStation}
                  onChange={(e) => setFromStation(e.target.value)}
                  className="h-10 w-full px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">Select station</option>
                  {stations.map((station) => (
                    <option key={station.id} value={station.id}>
                      {station.name} ({station.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  To Station
                </label>
                <select
                  value={toStation}
                  onChange={(e) => setToStation(e.target.value)}
                  className="h-10 w-full px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">Select station</option>
                  {stations.map((station) => (
                    <option key={station.id} value={station.id}>
                      {station.name} ({station.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  Journey Date
                </label>
                <Input
                  type="date"
                  value={journeyDate}
                  onChange={(e) => setJourneyDate(e.target.value)}
                  className="h-10"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Filter className="h-3.5 w-3.5 text-primary" />
                  Coach Type
                </label>
                <select
                  value={coachType}
                  onChange={(e) => setCoachType(e.target.value)}
                  className="h-10 w-full px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  {coachTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={handleSearch}
                  className="w-full h-10 bg-primary hover:bg-primary/90"
                >
                  Search Trains
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Available Trains{" "}
              <span className="text-muted-foreground">
                ({searchResults.length})
              </span>
            </h3>
            <div className="text-sm text-muted-foreground">
              {fromStation} → {toStation}
            </div>
          </div>

          <div className="space-y-4">
            {searchResults.map((train) => (
              <Card
                key={train.trainId}
                className="border-2 hover:border-primary/50 transition-all"
              >
                <CardContent className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Train className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">
                            {train.trainName}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {train.trainNumber}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {train.departureTime}
                          </span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {train.arrivalTime}
                          </span>
                          <span className="text-muted-foreground">
                            ({train.duration})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="text-right">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 text-sm font-medium mb-2">
                          <Users className="h-3.5 w-3.5" />
                          {train.availableSeats} seats available
                        </div>
                        <div className="text-sm text-muted-foreground">
                          BDT {train.minFare} - {train.maxFare}
                        </div>
                      </div>

                      <Link href={`/booking/${train.trainId}/schedule-1`}>
                        <Button className="bg-primary hover:bg-primary/90 h-10 px-6">
                          Book Now
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
