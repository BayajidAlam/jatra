"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Plus, Calendar, Clock, Train, MapPin } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Mock Data
const initialSchedules = [
  { 
    id: 1, 
    trainName: "Suborno Express", 
    trainNumber: "701",
    route: "Dhaka → Chittagong", 
    departureTime: "10:00 AM", 
    arrivalTime: "2:30 PM",
    frequency: "Daily",
    status: "Active"
  },
  { 
    id: 2, 
    trainName: "Mohanagar Godhuli", 
    trainNumber: "702",
    route: "Dhaka → Sylhet", 
    departureTime: "8:30 AM", 
    arrivalTime: "2:45 PM",
    frequency: "Daily",
    status: "Active"
  },
  { 
    id: 3, 
    trainName: "Parabat Express", 
    trainNumber: "703",
    route: "Dhaka → Rajshahi", 
    departureTime: "6:00 AM", 
    arrivalTime: "10:45 AM",
    frequency: "Wed, Fri, Sun",
    status: "Active"
  },
  { 
    id: 4, 
    trainName: "Sundarban Express", 
    trainNumber: "704",
    route: "Dhaka → Khulna", 
    departureTime: "7:15 AM", 
    arrivalTime: "12:30 PM",
    frequency: "Daily",
    status: "Cancelled"
  },
];

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState(initialSchedules);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSchedules = schedules.filter((schedule) =>
    schedule.trainName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schedule.trainNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schedule.route.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground dark:text-slate-100">
          Schedules Management
        </h1>
        <Button className="bg-primary text-primary-foreground gap-2">
          <Plus className="h-4 w-4" />
          Create Schedule
        </Button>
      </div>

      <Card className="dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 dark:border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 dark:border-slate-800">
          <CardTitle className="dark:text-slate-100">All Train Schedules</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search schedules..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Train</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Departure</TableHead>
                <TableHead>Arrival</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSchedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Train className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{schedule.trainName}</p>
                        <p className="text-xs text-muted-foreground">#{schedule.trainNumber}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm">{schedule.route}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm">{schedule.departureTime}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm">{schedule.arrivalTime}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm">{schedule.frequency}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        schedule.status === "Active"
                          ? "bg-green-100 text-green-700 hover:bg-green-100 border-green-200"
                          : "bg-red-100 text-red-700 hover:bg-red-100 border-red-200"
                      }
                      variant="outline"
                    >
                      {schedule.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
