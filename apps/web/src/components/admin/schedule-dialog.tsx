"use client";

import { useEffect, useState } from "react";
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
import { useToast } from "@/hooks/use-toast";

const scheduleSchema = z.object({
  trainName: z.string().min(2, "Train name is required"),
  trainNumber: z.string().min(3, "Train number is required"),
  route: z.string().min(3, "Route is required"),
  departureTime: z.string().min(1, "Departure time is required"),
  arrivalTime: z.string().min(1, "Arrival time is required"),
  frequency: z.string(),
  status: z.string(),
});

export type ScheduleFormValues = z.infer<typeof scheduleSchema>;

interface ScheduleDialogProps {
  initialData?: ScheduleFormValues;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ScheduleDialog({ initialData, trigger, open: controlledOpen, onOpenChange: setControlledOpen }: ScheduleDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = setControlledOpen !== undefined ? setControlledOpen : setInternalOpen;
  
  const { toast } = useToast();
  const isEditing = !!initialData;

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      trainName: "",
      trainNumber: "",
      route: "",
      departureTime: "",
      arrivalTime: "",
      frequency: "Daily",
      status: "On Time",
    },
  });

  useEffect(() => {
    if (initialData && open) {
      form.reset(initialData);
    } else if (!isEditing && open) {
      form.reset({
        trainName: "",
        trainNumber: "",
        route: "",
        departureTime: "",
        arrivalTime: "",
        frequency: "Daily",
        status: "On Time",
      });
    }
  }, [initialData, open, form, isEditing]);

  const onSubmit = (data: ScheduleFormValues) => {
    console.log(isEditing ? "Updating schedule:" : "Creating schedule:", data);
    toast({
      title: isEditing ? "Schedule Updated" : "Schedule Created",
      description: `Schedule for ${data.trainName} has been ${isEditing ? "updated" : "created"} successfully.`,
    });
    setOpen(false);
    if (!isEditing) form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : !isEditing ? (
        <DialogTrigger asChild>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            <Plus className="h-4 w-4" />
            Create Schedule
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent className="sm:max-w-[425px] dark:bg-slate-900 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="dark:text-slate-100">{isEditing ? "Edit Schedule" : "Create New Schedule"}</DialogTitle>
          <DialogDescription className="dark:text-slate-400">
            {isEditing ? "Update existing train schedule." : "Add a new schedule for a train route."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="trainName">Train Name</Label>
              <Input id="trainName" {...form.register("trainName")} placeholder="Suborno Express" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="trainNumber">Number</Label>
              <Input id="trainNumber" {...form.register("trainNumber")} placeholder="701" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="route">Route</Label>
            <Input id="route" {...form.register("route")} placeholder="Dhaka - Chattogram" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="departureTime">Departure</Label>
              <Input id="departureTime" {...form.register("departureTime")} type="time" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="arrivalTime">Arrival</Label>
              <Input id="arrivalTime" {...form.register("arrivalTime")} type="time" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select
                onValueChange={(val) => form.setValue("frequency", val)}
                value={form.watch("frequency")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Weekend">Weekend</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                onValueChange={(val) => form.setValue("status", val)}
                value={form.watch("status")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="On Time">On Time</SelectItem>
                  <SelectItem value="Delayed">Delayed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{isEditing ? "Save Changes" : "Create Schedule"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
