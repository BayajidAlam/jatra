"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const scheduleSchema = z.object({
  trainName: z.string().min(3, "Train name is required"),
  trainNumber: z.string().min(1, "Train number is required"),
  route: z.string().min(3, "Route is required"),
  departureTime: z.string().min(1, "Departure time is required"),
  arrivalTime: z.string().min(1, "Arrival time is required"),
  frequency: z.string(),
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

export function AddScheduleDialog() {
  const [open, setOpen] = useState(false);
  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      trainName: "",
      trainNumber: "",
      route: "",
      departureTime: "",
      arrivalTime: "",
      frequency: "Daily",
    },
  });

  const onSubmit = (data: ScheduleFormValues) => {
    console.log("Submitting schedule:", data);
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
          <Plus className="h-4 w-4" />
          Create Schedule
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Train Schedule</DialogTitle>
          <DialogDescription>
            Schedule a train on a specific route with departure and arrival times.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="trainName" className="text-right">
              Train
            </Label>
            <Input
              id="trainName"
              {...form.register("trainName")}
              className="col-span-3"
              placeholder="Suborno Express"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="trainNumber" className="text-right">
              Number
            </Label>
            <Input
              id="trainNumber"
              {...form.register("trainNumber")}
              className="col-span-3"
              placeholder="701"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="route" className="text-right">
              Route
            </Label>
            <Input
              id="route"
              {...form.register("route")}
              className="col-span-3"
              placeholder="Dhaka → Chittagong"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="departureTime" className="text-right">
              Departure
            </Label>
            <Input
              id="departureTime"
              type="time"
              {...form.register("departureTime")}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="arrivalTime" className="text-right">
              Arrival
            </Label>
            <Input
              id="arrivalTime"
              type="time"
              {...form.register("arrivalTime")}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="frequency" className="text-right">
              Frequency
            </Label>
            <Select
              onValueChange={(val) => form.setValue("frequency", val)}
              defaultValue={form.getValues("frequency")}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Daily">Daily</SelectItem>
                <SelectItem value="Mon-Fri">Mon-Fri</SelectItem>
                <SelectItem value="Weekends">Weekends</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit">Create Schedule</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
