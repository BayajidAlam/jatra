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
import { useToast } from "@/hooks/use-toast";

const routeSchema = z.object({
  routeName: z.string().min(3, "Route name is required (e.g. Dhaka - Chattogram)"),
  stations: z.coerce.number().min(2, "At least 2 stations required"),
  distance: z.string().min(1, "Distance is required"),
  duration: z.string().min(1, "Duration is required"),
  status: z.string(),
});

type RouteFormValues = z.infer<typeof routeSchema>;

export function AddRouteDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const form = useForm<RouteFormValues>({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      routeName: "",
      stations: 10,
      distance: "",
      duration: "",
      status: "Active",
    },
  });

  const onSubmit = (data: RouteFormValues) => {
    console.log("Submitting route:", data);
    toast({
      title: "Route Created",
      description: `Route ${data.routeName} has been created successfully.`,
    });
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
          <Plus className="h-4 w-4" />
          Create New Route
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Route</DialogTitle>
          <DialogDescription>
            Define a new railway route between stations.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="routeName" className="text-right">
              Name
            </Label>
            <Input
              id="routeName"
              {...form.register("routeName")}
              className="col-span-3"
              placeholder="e.g. Dhaka - Chattogram"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="stations" className="text-right">
              Stations
            </Label>
            <Input
              id="stations"
              type="number"
              {...form.register("stations")}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="distance" className="text-right">
              Distance
            </Label>
            <Input
              id="distance"
              {...form.register("distance")}
              className="col-span-3"
              placeholder="e.g. 320 km"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="duration" className="text-right">
              Duration
            </Label>
            <Input
              id="duration"
              {...form.register("duration")}
              className="col-span-3"
              placeholder="e.g. 5h 30m"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select
              onValueChange={(val) => form.setValue("status", val)}
              defaultValue={form.getValues("status")}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit">Create Route</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
