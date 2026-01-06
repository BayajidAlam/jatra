"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Edit2 } from "lucide-react";

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
import { useToast } from "@/hooks/use-toast";

import { useAdminStations } from "@/hooks/use-admin-stations";

const stationSchema = z.object({
  code: z.string().min(2, "Station code must be at least 2 characters"),
  name: z.string().min(3, "Station name is required"),
  city: z.string().min(2, "City is required"),
  district: z.string().min(2, "District is required"),
});

export type StationFormValues = z.infer<typeof stationSchema>;

interface StationDialogProps {
  initialData?: any;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function StationDialog({ initialData, trigger, open: controlledOpen, onOpenChange: setControlledOpen }: StationDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = setControlledOpen !== undefined ? setControlledOpen : setInternalOpen;
  
  const { toast } = useToast();
  const isEditing = !!initialData;
  const { createStation, updateStation, isCreating, isUpdating } = useAdminStations();

  const form = useForm<StationFormValues>({
    resolver: zodResolver(stationSchema),
    defaultValues: {
      code: "",
      name: "",
      city: "",
      district: "",
    },
  });

  useEffect(() => {
    if (initialData && open) {
      form.reset({
        code: initialData.code,
        name: initialData.name,
        city: initialData.city,
        district: initialData.district,
      });
    } else if (!isEditing && open) {
      form.reset({
        code: "",
        name: "",
        city: "",
        district: "",
      });
    }
  }, [initialData, open, form, isEditing]);

  const onSubmit = async (data: StationFormValues) => {
    try {
      if (isEditing) {
        await updateStation({ id: initialData.id, dto: data });
      } else {
        await createStation(data);
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
            Add Station
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent className="sm:max-w-[425px] dark:bg-slate-900 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="dark:text-slate-100">{isEditing ? "Edit Station" : "Add New Station"}</DialogTitle>
          <DialogDescription className="dark:text-slate-400">
            {isEditing 
                ? "Update the station details below." 
                : "Add a new railway station to the network."}
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
          <DialogFooter>
            <Button type="submit" disabled={isCreating || isUpdating}>
              {(isCreating || isUpdating) ? "Saving..." : (isEditing ? "Save Changes" : "Save Station")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
