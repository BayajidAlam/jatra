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
import { useAdminRoutes } from "@/hooks/use-admin-routes";

const routeSchema = z.object({
  routeName: z.string().min(3, "Route name is required (e.g. Dhaka - Chattogram)"),
  totalDistance: z.number().min(0, "Distance must be positive"),
  isActive: z.boolean(),
});

export type RouteFormValues = z.infer<typeof routeSchema>;

interface RouteDialogProps {
  initialData?: any;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function RouteDialog({ initialData, trigger, open: controlledOpen, onOpenChange: setControlledOpen }: RouteDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = setControlledOpen !== undefined ? setControlledOpen : setInternalOpen;
  
  const { toast } = useToast();
  const isEditing = !!initialData;
  const { createRoute, updateRoute, isCreating, isUpdating } = useAdminRoutes();

  const form = useForm<RouteFormValues>({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      routeName: "",
      totalDistance: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (initialData && open) {
      form.reset({
        routeName: initialData.routeName,
        totalDistance: initialData.totalDistance,
        isActive: initialData.isActive,
      });
    } else if (!isEditing && open) {
      form.reset({
        routeName: "",
        totalDistance: 0,
        isActive: true,
      });
    }
  }, [initialData, open, form, isEditing]);

  const onSubmit = async (data: RouteFormValues) => {
    try {
      if (isEditing) {
        await updateRoute({ id: initialData.id, dto: data });
      } else {
        await createRoute({ ...data, stops: [] });
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
            Create New Route
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent className="sm:max-w-[425px] dark:bg-slate-900 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="dark:text-slate-100">{isEditing ? "Edit Route" : "Create New Route"}</DialogTitle>
          <DialogDescription className="dark:text-slate-400">
            {isEditing 
                ? "Update the railway route details." 
                : "Define a new railway route between stations."}
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
            <Label htmlFor="totalDistance" className="text-right">
              Distance (km)
            </Label>
            <Input
              id="totalDistance"
              type="number"
              {...form.register("totalDistance", { valueAsNumber: true })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isActive" className="text-right">
              Status
            </Label>
            <Select
              onValueChange={(val) => form.setValue("isActive", val === "Active")}
              value={form.watch("isActive") ? "Active" : "Inactive"}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isCreating || isUpdating}>
              {(isCreating || isUpdating) ? "Saving..." : (isEditing ? "Save Changes" : "Create Route")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
