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

const stationSchema = z.object({
  code: z.string().min(2, "Station code must be at least 2 characters"),
  name: z.string().min(3, "Station name is required"),
  city: z.string().min(2, "City is required"),
  district: z.string().min(2, "District is required"),
  platformCount: z.coerce.number().min(1, "At least 1 platform required"),
});

type StationFormValues = z.infer<typeof stationSchema>;

export function AddStationDialog() {
  const [open, setOpen] = useState(false);
  const form = useForm<StationFormValues>({
    resolver: zodResolver(stationSchema),
    defaultValues: {
      code: "",
      name: "",
      city: "",
      district: "",
      platformCount: 4,
    },
  });

  const onSubmit = (data: StationFormValues) => {
    console.log("Submitting station:", data);
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
          <Plus className="h-4 w-4" />
          Add Station
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Station</DialogTitle>
          <DialogDescription>
            Add a new railway station to the network.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="code" className="text-right">
              Code
            </Label>
            <Input
              id="code"
              {...form.register("code")}
              className="col-span-3"
              placeholder="e.g. DA"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              {...form.register("name")}
              className="col-span-3"
              placeholder="Dhaka Kamalapur"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="city" className="text-right">
              City
            </Label>
            <Input
              id="city"
              {...form.register("city")}
              className="col-span-3"
              placeholder="Dhaka"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="district" className="text-right">
              District
            </Label>
            <Input
              id="district"
              {...form.register("district")}
              className="col-span-3"
              placeholder="Dhaka"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="platformCount" className="text-right">
              Platforms
            </Label>
            <Input
              id="platformCount"
              type="number"
              {...form.register("platformCount")}
              className="col-span-3"
            />
          </div>
          <DialogFooter>
            <Button type="submit">Save Station</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
