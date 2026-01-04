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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAdminSeats } from "@/hooks/use-admin-seats";
import { useAdminCoaches } from "@/hooks/use-admin-coaches";
import { useAdminTrains } from "@/hooks/use-admin-trains";

const seatSchema = z.object({
  coachId: z.string().min(1, "Coach is required"),
  seatNumber: z.string().min(1, "Seat number is required"),
  seatType: z.string().min(1, "Seat type is required"),
  baseFare: z.coerce.number().min(0, "Fare must be positive"),
});

const bulkSeatSchema = z.object({
  coachId: z.string().min(1, "Coach is required"),
  prefix: z.string().optional(),
  startNumber: z.coerce.number().min(1),
  count: z.coerce.number().min(1).max(100),
  seatType: z.string().min(1, "Seat type is required"),
  baseFare: z.coerce.number().min(0, "Fare must be positive"),
});

type SeatFormValues = z.infer<typeof seatSchema>;
type BulkSeatFormValues = z.infer<typeof bulkSeatSchema>;

interface SeatDialogProps {
  initialData?: any;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SeatDialog({ initialData, trigger, open: controlledOpen, onOpenChange: setControlledOpen }: SeatDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = setControlledOpen !== undefined ? setControlledOpen : setInternalOpen;
  const [mode, setMode] = useState<"single" | "bulk">("single");
  
  const { toast } = useToast();
  const isEditing = !!initialData;
  const { createSeat, bulkCreateSeats, updateSeat, isCreating, isBulkCreating, isUpdating } = useAdminSeats();
  
  // Need to fetch trains first, then coaches based on selected train
  // Simplified: fetching all coaches for now or filter by train in a real scenario
  const { trains } = useAdminTrains({ limit: 100 });
  const [selectedTrainId, setSelectedTrainId] = useState<string>("");
  const { coaches } = useAdminCoaches({ limit: 100, trainId: selectedTrainId || undefined });

  const form = useForm<SeatFormValues>({
    resolver: zodResolver(seatSchema),
    defaultValues: {
      coachId: "",
      seatNumber: "",
      seatType: "CHAIR",
      baseFare: 0,
    },
  });

  const bulkForm = useForm<BulkSeatFormValues>({
      resolver: zodResolver(bulkSeatSchema),
      defaultValues: {
          coachId: "",
          prefix: "",
          startNumber: 1,
          count: 20,
          seatType: "CHAIR",
          baseFare: 0,
      }
  });

  useEffect(() => {
    if (initialData && open) {
      // If editing, we need the train ID to pre-fill coaches
      if (initialData.coach?.train?.id && !selectedTrainId) {
          setSelectedTrainId(initialData.coach.train.id);
      }
      form.reset({
        coachId: initialData.coachId,
        seatNumber: initialData.seatNumber,
        seatType: initialData.seatType,
        baseFare: initialData.baseFare,
      });
      setMode("single");
    } else if (!isEditing && open) {
      form.reset({
        coachId: "",
        seatNumber: "",
        seatType: "CHAIR",
        baseFare: 0,
      });
      bulkForm.reset({
          coachId: "",
          prefix: "",
          startNumber: 1,
          count: 20,
          seatType: "CHAIR",
          baseFare: 0,
      });
    }
  }, [initialData, open, form, bulkForm, isEditing, selectedTrainId]); // added selectedTrainId to dependency to prevent loop if carefully handled? No, logic is fine.

  const onSingleSubmit = async (data: SeatFormValues) => {
    try {
      if (isEditing) {
        await updateSeat({ id: initialData.id, ...data });
      } else {
        await createSeat(data);
      }
      setOpen(false);
      form.reset();
    } catch (error) {
       // handled by hook
    }
  };

  const onBulkSubmit = async (data: BulkSeatFormValues) => {
      try {
          await bulkCreateSeats(data);
          setOpen(false);
          bulkForm.reset();
      } catch (error) {
          // handled
      }
  }

  const isLoading = isCreating || isUpdating || isBulkCreating;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : !isEditing ? (
        <DialogTrigger asChild>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            <Plus className="h-4 w-4" />
            Add Seats
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent className="sm:max-w-[500px] dark:bg-slate-900 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="dark:text-slate-100">{isEditing ? "Edit Seat" : "Add Seats"}</DialogTitle>
          <DialogDescription className="dark:text-slate-400">
            {isEditing ? "Update individual seat details." : "Add single or multiple seats to a coach."}
          </DialogDescription>
        </DialogHeader>

        {!isEditing ? (
            <Tabs value={mode} onValueChange={(v: any) => setMode(v)} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="single">Single Seat</TabsTrigger>
                    <TabsTrigger value="bulk">Bulk Create</TabsTrigger>
                </TabsList>
                
                {/* Single Creation Form */}
                <TabsContent value="single">
                   <form onSubmit={form.handleSubmit(onSingleSubmit)} className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label>Filter Train</Label>
                            <Select onValueChange={setSelectedTrainId} value={selectedTrainId}>
                                <SelectTrigger><SelectValue placeholder="Select Train" /></SelectTrigger>
                                <SelectContent>
                                    {trains.map(t => <SelectItem key={t.id} value={t.id}>{t.modelName} ({t.trainNumber})</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                           <Label htmlFor="coachId">Coach</Label>
                           <Select 
                              onValueChange={(val) => form.setValue("coachId", val)} 
                              value={form.watch("coachId")}
                              disabled={!selectedTrainId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={!selectedTrainId ? "Select a train first" : "Select Coach"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {coaches.map(c => <SelectItem key={c.id} value={c.id}>{c.coachCode} ({c.coachType})</SelectItem>)}
                                </SelectContent>
                           </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="seatNumber">Seat Number</Label>
                                <Input id="seatNumber" {...form.register("seatNumber")} placeholder="A1" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="baseFare">Base Fare</Label>
                                <Input id="baseFare" type="number" {...form.register("baseFare")} />
                            </div>
                        </div>
                         <div className="grid gap-2">
                             <Label htmlFor="seatType">Seat Type</Label>
                             <Select onValueChange={(val) => form.setValue("seatType", val)} value={form.watch("seatType")}>
                                <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="BERTH_LOWER">Berth Lower</SelectItem>
                                    <SelectItem value="BERTH_UPPER">Berth Upper</SelectItem>
                                    <SelectItem value="SEAT">Seat</SelectItem>
                                    <SelectItem value="CHAIR">Chair</SelectItem>
                                </SelectContent>
                             </Select>
                        </div>
                         <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? "Creating..." : "Create Seat"}
                        </Button>
                   </form>
                </TabsContent>

                {/* Bulk Creation Form */}
                <TabsContent value="bulk">
                    <form onSubmit={bulkForm.handleSubmit(onBulkSubmit)} className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label>Filter Train</Label>
                            <Select onValueChange={setSelectedTrainId} value={selectedTrainId}>
                                <SelectTrigger><SelectValue placeholder="Select Train" /></SelectTrigger>
                                <SelectContent>
                                    {trains.map(t => <SelectItem key={t.id} value={t.id}>{t.modelName} ({t.trainNumber})</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                           <Label htmlFor="bulkCoachId">Coach</Label>
                           <Select 
                              onValueChange={(val) => bulkForm.setValue("coachId", val)} 
                              value={bulkForm.watch("coachId")}
                              disabled={!selectedTrainId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={!selectedTrainId ? "Select a train first" : "Select Coach"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {coaches.map(c => <SelectItem key={c.id} value={c.id}>{c.coachCode} ({c.coachType})</SelectItem>)}
                                </SelectContent>
                           </Select>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                             <div className="grid gap-2">
                                <Label htmlFor="prefix">Prefix</Label>
                                <Input id="prefix" {...bulkForm.register("prefix")} placeholder="A" />
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="startNumber">Start</Label>
                                <Input id="startNumber" type="number" {...bulkForm.register("startNumber")} />
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="count">Count</Label>
                                <Input id="count" type="number" {...bulkForm.register("count")} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="bulkBaseFare">Base Fare</Label>
                                <Input id="bulkBaseFare" type="number" {...bulkForm.register("baseFare")} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="bulkSeatType">Seat Type</Label>
                                <Select onValueChange={(val) => bulkForm.setValue("seatType", val)} value={bulkForm.watch("seatType")}>
                                    <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="BERTH_LOWER">Berth Lower</SelectItem>
                                        <SelectItem value="BERTH_UPPER">Berth Upper</SelectItem>
                                        <SelectItem value="SEAT">Seat</SelectItem>
                                        <SelectItem value="CHAIR">Chair</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                         <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? "creating..." : "Bulk Create Seats"}
                        </Button>
                    </form>
                </TabsContent>
            </Tabs>
        ) : (
             <form onSubmit={form.handleSubmit(onSingleSubmit)} className="space-y-4 py-4">
                 {/* Simplified Edit Form - usually we don't move seats between coaches easily */}
                 <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="seatNumber">Seat Number</Label>
                        <Input id="seatNumber" {...form.register("seatNumber")} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="baseFare">Base Fare</Label>
                        <Input id="baseFare" type="number" {...form.register("baseFare")} />
                    </div>
                </div>
                    <div className="grid gap-2">
                        <Label htmlFor="seatType">Seat Type</Label>
                        <Select onValueChange={(val) => form.setValue("seatType", val)} value={form.watch("seatType")}>
                        <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="BERTH_LOWER">Berth Lower</SelectItem>
                            <SelectItem value="BERTH_UPPER">Berth Upper</SelectItem>
                            <SelectItem value="SEAT">Seat</SelectItem>
                            <SelectItem value="CHAIR">Chair</SelectItem>
                        </SelectContent>
                        </Select>
                </div>
                    <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? "Saving..." : "Save Changes"}
                </Button>
            </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
