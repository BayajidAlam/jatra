"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Train,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  Filter,
  Users,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTrainSearch } from "@/hooks/use-train-search";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { StationSelect } from "@/components/station-select";

const coachTypes = ["All", "AC_CHAIR", "AC_BERTH", "SNIGDHA", "SHOVAN"]; // Updated to match likely Enum

function SearchTrainsContent() {
  const searchParams = useSearchParams();
  const [fromStation, setFromStation] = useState(searchParams.get("from") || "");
  const [toStation, setToStation] = useState(searchParams.get("to") || "");
  const [journeyDate, setJourneyDate] = useState(searchParams.get("date") || "");
  const [coachType, setCoachType] = useState("All");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const { useStations, searchJourneys } = useTrainSearch();
  const { data: stations, isLoading: isLoadingStations } = useStations();

  const handleSearch = async () => {
    if (!fromStation || !toStation || !journeyDate) {
      toast({
        title: "Missing Fields",
        description: "Please select From, To stations and Date.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    try {
      const results = await searchJourneys({
        from: fromStation,
        to: toStation,
        date: journeyDate,
      });
      
      let data = results.data || [];
      
      // Client-side filtering for Coach Type since backend doesn't support it yet
      if (coachType !== "All") {
          data = data.filter((journey: any) => 
              journey.train.coaches.some((c: any) => c.coachType === coachType)
          );
      }

      setSearchResults(data);
    } catch (error) {
      console.error("Search failed:", error);
      toast({
        title: "Search Failed",
        description: "Could not fetch trains. Please try again.",
        variant: "destructive",
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (searchParams.get("from") && searchParams.get("to") && searchParams.get("date") && !hasSearched) {
       handleSearch();
    }
  }, [searchParams]);

  return (
      <div className="container mx-auto px-4 lg:px-8 py-8">
        {/* Search Form */}
        <Card className="mb-8 border-border bg-card/60 backdrop-blur-md shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Train className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Find Your Train</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="min-w-0">
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  From Station
                </label>
                <StationSelect
                  value={fromStation}
                  onChange={setFromStation}
                  stations={stations}
                  placeholder="Select station"
                  disabled={isLoadingStations}
                  className="h-10"
                />
              </div>

              <div className="min-w-0">
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  To Station
                </label>
                <StationSelect
                  value={toStation}
                  onChange={setToStation}
                  stations={stations}
                  placeholder="Select station"
                  disabled={isLoadingStations}
                  className="h-10"
                />
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
                  min={new Date().toISOString().split('T')[0]}
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
                  disabled={isSearching}
                >
                  {isSearching ? "Searching..." : "Search Trains"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {hasSearched && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Available Trains{" "}
                <span className="text-muted-foreground">
                  ({searchResults.length})
                </span>
              </h3>
              <div className="text-sm text-muted-foreground">
                {stations?.find(s => s.id === fromStation)?.name} → {stations?.find(s => s.id === toStation)?.name} - {journeyDate}
              </div>
            </div>

            {isSearching ? (
               <div className="space-y-4">
                 {[1, 2, 3].map((i) => (
                   <div key={i} className="p-6 border rounded-lg bg-card/40">
                     <Skeleton className="h-6 w-48 mb-4" />
                     <Skeleton className="h-4 w-32" />
                   </div>
                 ))}
               </div>
            ) : searchResults.length === 0 ? (
                <div className="text-center py-12 bg-card/40 rounded-lg border border-dashed">
                    <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No trains found</h3>
                    <p className="text-muted-foreground">Try changing the date or stations.</p>
                </div>
            ) : (
              <div className="space-y-4">
                {searchResults.map((journey) => (
                  <Card
                    key={journey.id}
                    className="border-border bg-card/40 backdrop-blur-sm hover:bg-card/60 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md"
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
                                {journey.train.name}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {journey.train.trainNumber}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {format(new Date(journey.departureTime), "HH:mm")}
                              </span>
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {format(new Date(journey.arrivalTime), "HH:mm")}
                              </span>
                              <span className="text-muted-foreground">
                                {/* Calculate duration roughly if needed */}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <div className="text-right">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium mb-2 ${journey.availableSeats > 0 ? 'bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-red-500/10 text-red-700'}`}>
                              <Users className="h-3.5 w-3.5" />
                              {journey.availableSeats} seats available
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {/* Price range would need nested coach/seat inspection or stored in journey */}
                                {/* Assuming Backend provides minFare/maxFare or we just show 'View Details' */}
                            </div>
                          </div>

                          <Link 
                            href={{
                              pathname: `/booking/${journey.id}`,
                              query: {
                                fromStationId: fromStation,
                                toStationId: toStation,
                              }
                            }}
                          >
                            <Button className="bg-primary hover:bg-primary/90 h-10 px-6" disabled={journey.availableSeats === 0}>
                              {journey.availableSeats > 0 ? "Book Now" : "Full"}
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
  );
}

export default function SearchTrainsPage() {
    return (
        <div className="min-h-screen bg-background">
             <Suspense fallback={
                <div className="container mx-auto px-4 py-8">
                     <Skeleton className="h-64 w-full mb-8" />
                     <Skeleton className="h-20 w-full mb-4" />
                     <Skeleton className="h-20 w-full mb-4" />
                </div>
             }>
                 <SearchTrainsContent />
             </Suspense>
        </div>
    )
}
