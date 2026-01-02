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

const trainSchema = z.object({
  name: z.string().min(2, "Train name must be at least 2 characters"),
  trainNumber: z.string().min(3, "Train number is required"),
  type: z.string(),
  seats: z.coerce.number().min(1, "Capacity must be at least 1"),
});

type TrainFormValues = z.infer<typeof trainSchema>;

export function AddTrainDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const form = useForm<TrainFormValues>({
    resolver: zodResolver(trainSchema),
    defaultValues: {
      name: "",
      trainNumber: "",
      type: "Intercity",
      seats: 500,
    },
  });

  const onSubmit = (data: TrainFormValues) => {
    console.log("Submitting train:", data);
    toast({
      title: "Train Created",
      description: `${data.name} (${data.trainNumber}) has been added successfully.`,
    });
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
          <Plus className="h-4 w-4" />
          Add New Train
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Train</DialogTitle>
          <DialogDescription>
            Enter the details of the new train to add it to the fleet.
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
              defaultValue={form.getValues("type")}
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="seats" className="text-right">
              Capacity
            </Label>
            <Input
              id="seats"
              type="number"
              {...form.register("seats")}
              className="col-span-3"
            />
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
