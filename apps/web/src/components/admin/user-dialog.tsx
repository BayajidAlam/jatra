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
import { useAdminUsers } from "@/hooks/use-admin-users";

const userSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(11, "Phone number is required"),
  nid: z.string().min(10, "NID must be 10 or 13 digits"),
  role: z.string(),
});

export type UserFormValues = z.infer<typeof userSchema>;

interface UserDialogProps {
  initialData?: any;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function UserDialog({ initialData, trigger, open: controlledOpen, onOpenChange: setControlledOpen }: UserDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = setControlledOpen !== undefined ? setControlledOpen : setInternalOpen;
  
  const { toast } = useToast();
  const isEditing = !!initialData;
  const { updateUser, isUpdating } = useAdminUsers();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      nid: "",
      role: "USER",
    },
  });

  useEffect(() => {
    if (initialData && open) {
      form.reset({
        name: initialData.name,
        email: initialData.email,
        phone: initialData.phone,
        nid: initialData.nid,
        role: initialData.role,
      });
    } else if (!isEditing && open) {
      form.reset({
        name: "",
        email: "",
        phone: "",
        nid: "",
        role: "USER",
      });
    }
  }, [initialData, open, form, isEditing]);

  const onSubmit = async (data: UserFormValues) => {
    try {
      if (isEditing) {
        await updateUser({ id: initialData.id, ...data });
      } else {
          // Creating users is typically done via registration or a separate endpoint
          toast({ title: "Note", description: "Creating new users from admin is currently disabled. Please use registration." });
      }
      setOpen(false);
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
            Add User
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent className="sm:max-w-[425px] dark:bg-slate-900 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="dark:text-slate-100">{isEditing ? "Edit User" : "Add New User"}</DialogTitle>
          <DialogDescription className="dark:text-slate-400">
             {isEditing ? "Update user account information." : "Create a new user account for the platform."}
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
              placeholder="Full Name"
              disabled={isEditing} // Usually name is not changed like this
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              className="col-span-3"
              placeholder="user@example.com"
              disabled={isEditing}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Phone
            </Label>
            <Input
              id="phone"
              {...form.register("phone")}
              className="col-span-3"
              placeholder="01712xxxxxx"
              disabled={isEditing}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nid" className="text-right">
              NID
            </Label>
            <Input
              id="nid"
              {...form.register("nid")}
              className="col-span-3"
              placeholder="10 or 13 digits"
              disabled={isEditing}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Role
            </Label>
            <Select
              onValueChange={(val) => form.setValue("role", val)}
              value={form.watch("role")}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">User / Passenger</SelectItem>
                <SelectItem value="STAFF">Railway Staff</SelectItem>
                <SelectItem value="ADMIN">Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? "Saving..." : (isEditing ? "Update User" : "Create User")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
