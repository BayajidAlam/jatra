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
import { useAdminSchedules } from "@/hooks/use-admin-schedules";
import { useAdminTrains } from "@/hooks/use-admin-trains";
import { useAdminRoutes } from "@/hooks/use-admin-routes";

const scheduleSchema = z.object({
  trainId: z.string().min(1, "Train is required"),
  routeId: z.string().min(1, "Route is required"),
  departureTime: z.string().min(1, "Departure time is required"),
  arrivalTime: z.string().min(1, "Arrival time is required"),
  journeyDate: z.string().min(1, "Journey date is required"),
  status: z.string(),
});

export type ScheduleFormValues = z.infer<typeof scheduleSchema>;

interface ScheduleDialogProps {
  initialData?: any;
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
  const { createSchedule, isCreating } = useAdminSchedules();
  const { trains, isLoading: isLoadingTrains } = useAdminTrains({ limit: 100 });
  const { routes, isLoading: isLoadingRoutes } = useAdminRoutes();

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      trainId: "",
      routeId: "",
      departureTime: "",
      arrivalTime: "",
      journeyDate: new Date().toISOString().split('T')[0],
      status: "SCHEDULED",
    },
  });

  useEffect(() => {
    if (initialData && open) {
      form.reset({
        trainId: initialData.train.id,
        routeId: initialData.route.id,
        departureTime: new Date(initialData.departureTime).toTimeString().slice(0, 5),
        arrivalTime: new Date(initialData.arrivalTime).toTimeString().slice(0, 5),
        journeyDate: new Date(initialData.journeyDate).toISOString().split('T')[0],
        status: initialData.status,
      });
    } else if (!isEditing && open) {
      form.reset({
        trainId: "",
        routeId: "",
        departureTime: "",
        arrivalTime: "",
        journeyDate: new Date().toISOString().split('T')[0],
        status: "SCHEDULED",
      });
    }
  }, [initialData, open, form, isEditing]);

  const onSubmit = async (data: ScheduleFormValues) => {
    try {
      // Convert time to ISO string for the specific date
      const dep = new Date(`${data.journeyDate}T${data.departureTime}:00`);
      const arr = new Date(`${data.journeyDate}T${data.arrivalTime}:00`);
      
      const payload = {
          ...data,
          departureTime: dep.toISOString(),
          arrivalTime: arr.toISOString(),
          journeyDate: new Date(data.journeyDate).toISOString(),
      };

      if (isEditing) {
        toast({ title: "Note", description: "Update journey not yet implemented in backend" });
      } else {
        await createSchedule(payload);
      }
      setOpen(false);
      if (!isEditing) form.reset();
    } catch (error) {
      // Error handled by hook
    }
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
          <div className="grid gap-2">
            <Label htmlFor="trainId">Train</Label>
            <Select
              onValueChange={(val) => form.setValue("trainId", val)}
              value={form.watch("trainId")}
              disabled={isLoadingTrains}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoadingTrains ? "Loading trains..." : "Select Train"} />
              </SelectTrigger>
              <SelectContent>
                {trains.map((train) => (
                    <SelectItem key={train.id} value={train.id}>
                        {train.name} (#{train.trainNumber})
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="routeId">Route</Label>
            <Select
              onValueChange={(val) => form.setValue("routeId", val)}
              value={form.watch("routeId")}
              disabled={isLoadingRoutes}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoadingRoutes ? "Loading routes..." : "Select Route"} />
              </SelectTrigger>
              <SelectContent>
                {routes.map((route) => (
                    <SelectItem key={route.id} value={route.id}>
                        {route.routeName}
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
              <Label htmlFor="journeyDate">Journey Date</Label>
              <Input id="journeyDate" {...form.register("journeyDate")} type="date" />
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
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="ACTIVE">Active / Running</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="DELAYED">Delayed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating..." : (isEditing ? "Save Changes" : "Create Schedule")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
