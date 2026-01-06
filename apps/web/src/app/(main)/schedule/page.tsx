"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, Search, Train, Clock, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import apiClient from "@/lib/axios-client";
import { API_ENDPOINTS } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";

// Reuse types or define simplified ones
interface TrainSchedule {
    id: string;
    trainName: string;
    trainNumber: string;
    fromStation: string;
    toStation: string;
    departureTime: string; // HH:mm
    arrivalTime: string;   // HH:mm
    offDay?: string;
    type: string;
}

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<TrainSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("time");

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      // In a real scenario, this would be a public endpoint.
      // Using admin endpoint or mock for now as per plan.
      // Checking if we can use admin-service public proxy or if we should mock.
      // Since unauth access to admin endpoints is blocked, we will mock for public view 
      // OR assume 'search-trains' logic provides this data.
      // Using Mock Data consistent with 'search-trains' for now to ensure reliability without auth.
      
      const mockData: TrainSchedule[] = [
        { id: "1", trainName: "Suborno Express", trainNumber: "701", fromStation: "Dhaka", toStation: "Chittagong", departureTime: "07:00", arrivalTime: "12:30", offDay: "Friday", type: "Intercity" },
        { id: "2", trainName: "Sonar Bangla", trainNumber: "788", fromStation: "Dhaka", toStation: "Chittagong", departureTime: "16:30", arrivalTime: "22:00", offDay: "Saturday", type: "Intercity" },
        { id: "3", trainName: "Parabat Express", trainNumber: "709", fromStation: "Dhaka", toStation: "Sylhet", departureTime: "06:20", arrivalTime: "13:00", offDay: "Tuesday", type: "Intercity" },
        { id: "4", trainName: "Teesta Express", trainNumber: "707", fromStation: "Dhaka", toStation: "Dewanganj", departureTime: "07:30", arrivalTime: "13:00", offDay: "Monday", type: "Intercity" },
        { id: "5", trainName: "Mohanagar Godhuli", trainNumber: "721", fromStation: "Chittagong", toStation: "Dhaka", departureTime: "15:00", arrivalTime: "21:10", offDay: "Sunday", type: "Intercity" },
        { id: "6", trainName: "Turna Nishitha", trainNumber: "741", fromStation: "Chittagong", toStation: "Dhaka", departureTime: "23:00", arrivalTime: "06:20", offDay: "None", type: "Intercity" },
      ];

      setTimeout(() => {
        setSchedules(mockData);
        setLoading(false);
      }, 800);
      
    } catch (error) {
      console.error("Failed to fetch schedules", error);
      setLoading(false);
    }
  };

  const filteredSchedules = schedules.filter(s => 
    s.trainName.toLowerCase().includes(search.toLowerCase()) || 
    s.fromStation.toLowerCase().includes(search.toLowerCase()) ||
    s.toStation.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === 'time') return a.departureTime.localeCompare(b.departureTime);
    if (sortBy === 'name') return a.trainName.localeCompare(b.trainName);
    return 0;
  });

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 lg:px-8 py-8 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Clock className="h-8 w-8 text-primary" />
              Train Schedule
            </h1>
            <p className="text-muted-foreground mt-1">
              Timetable for all intercity trains
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                   placeholder="Search train or station..."
                   className="pl-9 w-[250px]"
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                />
             </div>
             <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                   <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                   <SelectItem value="time">Time</SelectItem>
                   <SelectItem value="name">Name</SelectItem>
                </SelectContent>
             </Select>
          </div>
        </div>

        {loading ? (
           <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-muted/30 animate-pulse rounded-lg border" />
              ))}
           </div>
        ) : (
          <div className="grid gap-4">
             {filteredSchedules.map((schedule) => (
               <Card key={schedule.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                     <div className="grid md:grid-cols-4 gap-6 items-center">
                        <div className="flex items-center gap-4 md:col-span-1">
                           <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <Train className="h-6 w-6 text-primary" />
                           </div>
                           <div>
                              <h3 className="font-bold text-lg">{schedule.trainName}</h3>
                              <Badge variant="outline" className="font-mono text-xs">{schedule.trainNumber}</Badge>
                           </div>
                        </div>

                        <div className="md:col-span-2 flex items-center justify-between md:justify-center gap-8">
                           <div className="text-center">
                              <p className="text-2xl font-bold">{schedule.departureTime}</p>
                              <p className="text-sm font-medium text-muted-foreground">{schedule.fromStation}</p>
                           </div>
                           
                           <div className="flex flex-col items-center gap-1 flex-1 max-w-[120px]">
                              <span className="text-xs text-muted-foreground">{schedule.type}</span>
                              <div className="h-[2px] w-full bg-border relative">
                                 <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
                              </div>
                           </div>

                           <div className="text-center">
                              <p className="text-2xl font-bold">{schedule.arrivalTime}</p>
                              <p className="text-sm font-medium text-muted-foreground">{schedule.toStation}</p>
                           </div>
                        </div>

                        <div className="md:col-span-1 flex flex-row md:flex-col items-center md:items-end justify-between gap-2">
                           {schedule.offDay && schedule.offDay !== "None" && (
                              <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200 border-none">
                                 Off Day: {schedule.offDay}
                              </Badge>
                           )}
                           <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 border-none">
                              Available
                           </Badge>
                        </div>
                     </div>
                  </CardContent>
               </Card>
             ))}
             
             {filteredSchedules.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                   No trains found matching your search.
                </div>
             )}
          </div>
        )}
      </main>
    </div>
  );
}
