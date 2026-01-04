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
import { useAdminCoaches } from "@/hooks/use-admin-coaches";
import { useAdminTrains } from "@/hooks/use-admin-trains";

const coachSchema = z.object({
  trainId: z.string().min(1, "Train is required"),
  coachCode: z.string().min(1, "Coach code is required").max(3, "Max 3 chars"),
  coachType: z.string().min(1, "Coach type is required"),
  totalSeats: z.coerce.number().min(1, "Must have at least 1 seat"),
});

export type CoachFormValues = z.infer<typeof coachSchema>;

interface CoachDialogProps {
  initialData?: any;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CoachDialog({ initialData, trigger, open: controlledOpen, onOpenChange: setControlledOpen }: CoachDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = setControlledOpen !== undefined ? setControlledOpen : setInternalOpen;
  
  const { toast } = useToast();
  const isEditing = !!initialData;
  const { createCoach, updateCoach, isCreating, isUpdating } = useAdminCoaches();
  const { trains, isLoading: isLoadingTrains } = useAdminTrains({ limit: 100 });

  const form = useForm<CoachFormValues>({
    resolver: zodResolver(coachSchema) as any,
    defaultValues: {
      trainId: "",
      coachCode: "",
      coachType: "SHOVAN_CHAIR",
      totalSeats: 60,
    },
  });

  useEffect(() => {
    if (initialData && open) {
      form.reset({
        trainId: initialData.trainId,
        coachCode: initialData.coachCode,
        coachType: initialData.coachType,
        totalSeats: initialData.totalSeats,
      });
    } else if (!isEditing && open) {
      form.reset({
        trainId: "",
        coachCode: "",
        coachType: "SHOVAN_CHAIR",
        totalSeats: 60,
      });
    }
  }, [initialData, open, form, isEditing]);

  const onSubmit = async (data: CoachFormValues) => {
    try {
      if (isEditing) {
        await updateCoach({ id: initialData.id, ...data });
      } else {
        await createCoach(data);
      }
      setOpen(false);
      if (!isEditing) form.reset();
    } catch (error) {
      // Error handled by hook
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : !isEditing ? (
        <DialogTrigger asChild>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            <Plus className="h-4 w-4" />
            Add Coach
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent className="sm:max-w-[425px] dark:bg-slate-900 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="dark:text-slate-100">{isEditing ? "Edit Coach" : "Add New Coach"}</DialogTitle>
          <DialogDescription className="dark:text-slate-400">
            {isEditing ? "Update coach details." : "Add a new coach to a train."}
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
            {form.formState.errors.trainId && (
                <p className="text-xs text-destructive">{form.formState.errors.trainId.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="coachCode">Coach Code</Label>
                <Input 
                    id="coachCode" 
                    {...form.register("coachCode")} 
                    placeholder="KA" 
                    className="uppercase"
                />
                 {form.formState.errors.coachCode && (
                    <p className="text-xs text-destructive">{form.formState.errors.coachCode.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="totalSeats">Capacity</Label>
                <Input 
                    id="totalSeats" 
                    type="number"
                    min="1"
                    {...form.register("totalSeats")} 
                />
                {form.formState.errors.totalSeats && (
                    <p className="text-xs text-destructive">{form.formState.errors.totalSeats.message}</p>
                )}
              </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="coachType">Coach Type</Label>
            <Select
              onValueChange={(val) => form.setValue("coachType", val)}
              value={form.watch("coachType")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SHOVAN">Shovan</SelectItem>
                <SelectItem value="SHOVAN_CHAIR">Shovan Chair</SelectItem>
                <SelectItem value="SNIGDHA">Snigdha (AC)</SelectItem>
                <SelectItem value="AC_CHAIR">AC Chair</SelectItem>
                <SelectItem value="AC_SEAT">AC Seat</SelectItem>
                <SelectItem value="AC_BERTH">AC Berth</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.coachType && (
                <p className="text-xs text-destructive">{form.formState.errors.coachType.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : (isEditing ? "Save Changes" : "Create Coach")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
