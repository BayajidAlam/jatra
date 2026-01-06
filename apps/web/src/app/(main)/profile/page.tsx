"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit2, User, Shield, CreditCard, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
        // Redirect if not logged in
        router.push("/login"); // or open login modal
    }
    if (user) {
        setFormData({
            name: user.name,
            email: user.email,
            phone: user.phone,
        });
    }
  }, [user, isLoading, isAuthenticated, router]);

  const handleSave = () => {
    // TODO: Implement profile update API
    console.log("Updating profile", formData);
    setIsEditing(false);
  };

  if (isLoading || !user) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">


      <div className="container mx-auto px-4 lg:px-8 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground">
              Manage your account and personal details
            </p>
          </div>
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>
                  Make changes to your profile here. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    value={formData.email}
                    disabled
                    className="col-span-3 bg-muted"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleSave}>
                  Save changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-2 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Full Name
                  </p>
                  <p className="text-lg font-semibold">{user.name}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Email Address
                  </p>
                  <p className="text-lg font-mono">{user.email}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Phone Number
                  </p>
                  <p className="text-lg font-mono">{user.phone}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    National ID (NID)
                  </p>
                  <p className="text-lg font-mono">{user.nid || "N/A"}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Member Since
                  </p>
                  <p className="text-lg font-mono">{user.createdAt ? format(new Date(user.createdAt), "MMM dd, yyyy") : "N/A"}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h3 className="font-medium mb-4">Quick Links</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Link href="/my-bookings">
                    <Button
                      variant="outline"
                      className="w-full justify-start h-auto py-3 bg-transparent border-2 hover:bg-muted"
                    >
                      <div className="text-left">
                        <div className="font-semibold">My Bookings</div>
                        <div className="text-xs text-muted-foreground">
                          View travel history
                        </div>
                      </div>
                    </Button>
                  </Link>
                  <Link href="/my-tickets">
                    <Button
                      variant="outline"
                      className="w-full justify-start h-auto py-3 bg-transparent border-2 hover:bg-muted"
                    >
                      <div className="text-left">
                        <div className="font-semibold">My Tickets</div>
                        <div className="text-xs text-muted-foreground">
                          Access active tickets
                        </div>
                      </div>
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-2 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Password
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-mono">••••••••</p>
                    <Button variant="link" size="sm" className="h-auto p-0">
                      Change
                    </Button>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm">Two-Factor Auth</span>
                    <Badge variant="outline" className="text-muted-foreground">
                      Disabled
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                    {/* Placeholder for payment methods */}
                    <div className="text-sm text-center text-muted-foreground py-4">
                        No saved payment methods.
                    </div>
                  
                  <Button variant="outline" className="w-full border-dashed">
                    + Add New Method
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
