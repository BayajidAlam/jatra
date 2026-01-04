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

import { useAdminTrains } from "@/hooks/use-admin-trains";

const trainSchema = z.object({
  name: z.string().min(2, "Train name must be at least 2 characters"),
  trainNumber: z.string().min(3, "Train number is required"),
  type: z.string(),
});

export type TrainFormValues = z.infer<typeof trainSchema>;

interface TrainDialogProps {
  initialData?: any; // Using any for simplicity as it comes from API
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TrainDialog({ initialData, trigger, open: controlledOpen, onOpenChange: setControlledOpen }: TrainDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = setControlledOpen !== undefined ? setControlledOpen : setInternalOpen;
  
  const { toast } = useToast();
  const isEditing = !!initialData;
  const { createTrain, updateTrain, isCreating, isUpdating } = useAdminTrains();

  const form = useForm<TrainFormValues>({
    resolver: zodResolver(trainSchema),
    defaultValues: {
      name: "",
      trainNumber: "",
      type: "Intercity",
    },
  });

  useEffect(() => {
    if (initialData && open) {
      form.reset({
        name: initialData.name,
        trainNumber: initialData.trainNumber,
        type: initialData.type,
      });
    } else if (!isEditing && open) {
       form.reset({
        name: "",
        trainNumber: "",
        type: "Intercity",
      });
    }
  }, [initialData, open, form, isEditing]);

  const onSubmit = async (data: TrainFormValues) => {
    try {
      if (isEditing) {
        await updateTrain({ id: initialData.id, dto: data });
      } else {
        await createTrain({ ...data, totalSeats: 500 }); // Assuming default capacity for now or adding field
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
            Add New Train
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent className="sm:max-w-[425px] dark:bg-slate-900 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="dark:text-slate-100">{isEditing ? "Edit Train" : "Add New Train"}</DialogTitle>
          <DialogDescription className="dark:text-slate-400">
            {isEditing 
                ? "Update the train details in the fleet." 
                : "Enter the details of the new train to add it to the fleet."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              {...form.register("name")}
              className="col-span-3"
              placeholder="e.g. Suborno Express"
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
              placeholder="e.g. 701"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select
              onValueChange={(val) => form.setValue("type", val)}
              value={form.watch("type")}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Intercity">Intercity</SelectItem>
                <SelectItem value="Mail">Mail</SelectItem>
                <SelectItem value="Commuter">Commuter</SelectItem>
                <SelectItem value="Non-Stop">Non-Stop</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4 text-xs italic text-muted-foreground">
            <div className="col-start-2 col-span-3">
              * Capacity is managed via Coaches
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isCreating || isUpdating}>
              {(isCreating || isUpdating) ? "Saving..." : (isEditing ? "Save Changes" : "Save Train")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
