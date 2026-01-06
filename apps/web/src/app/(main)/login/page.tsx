"use client";

import type React from "react";

import { useState, Suspense } from "react";
import { Mail, Lock, Train, Shield, UserIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const testAccounts = [
  {
    role: "ADMIN",
    email: "admin@jatra.com",
    password: "admin123",
    label: "Admin Access",
    description: "Full system control",
    icon: Shield,
    color: "primary",
  },
  {
    role: "USER",
    email: "user@jatra.com",
    password: "user123",
    label: "User Account",
    description: "Book & manage tickets",
    icon: UserIcon,
    color: "primary",
  },
];

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const { login, isLoading } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const handleTestAccountSelect = (account: (typeof testAccounts)[0]) => {
    setEmail(account.email);
    setPassword(account.password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ emailOrPhone: email, password });
      toast({ title: "Login successful", description: "Welcome back!" });
      
      const redirectUrl = searchParams.get("redirect") || "/";
      router.push(redirectUrl);
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.response?.data?.message || "Invalid credentials",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
            <p className="text-base text-muted-foreground">
              Sign in to your Jatra Railway account
            </p>
          </div>

          <Card className="border-2">
            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" />
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) =>
                        setRememberMe(checked as boolean)
                      }
                    />
                    <label
                      htmlFor="remember"
                      className="text-sm text-muted-foreground cursor-pointer select-none"
                    >
                      Remember me
                    </label>
                  </div>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base"
                >
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                {/* Quick Test Login */}
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground text-center mb-3">
                    Quick test login:
                  </p>
                  <div className="flex gap-2">
                    {testAccounts.map((account) => {
                      const Icon = account.icon;
                      return (
                        <Button
                          key={account.role}
                          type="button"
                          variant="outline"
                          onClick={() => handleTestAccountSelect(account)}
                          className="flex-1 h-9 text-xs"
                        >
                          <Icon className="h-3 w-3 mr-1.5" />
                          {account.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-primary hover:underline font-medium"
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
