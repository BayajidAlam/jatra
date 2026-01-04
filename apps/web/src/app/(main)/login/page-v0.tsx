"use client";

import type React from "react";

import { useState } from "react";
import { Mail, Lock, Train, Shield, UserIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

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

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleTestAccountSelect = (account: (typeof testAccounts)[0]) => {
    setEmail(account.email);
    setPassword(account.password);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login:", { email, password, rememberMe });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Train className="h-6 w-6 text-primary" />
              <span className="text-xl font-semibold text-foreground">
                Jatra Railway
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Don't have an account?
              </span>
              <Link href="/signup">
                <Button variant="outline" className="text-sm bg-transparent">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-6 items-start">
          {/* Left Side - Login Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
              <p className="text-base text-muted-foreground">
                Sign in to your Jatra Railway account
              </p>
            </div>

            <Card className="border-2">
              <CardContent className="p-5">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-10"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-2">
                      <Lock className="h-4 w-4 text-primary" />
                      Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-10"
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
                      href="#"
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                  >
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-primary hover:underline font-medium"
              >
                Sign up for free
              </Link>
            </p>
          </div>

          {/* Right Side - Test Accounts */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <Card className="border-2 border-primary/20 bg-muted/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Test Login</CardTitle>
                <CardDescription className="text-sm">
                  Click to auto-fill credentials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {testAccounts.map((account) => {
                  const Icon = account.icon;
                  return (
                    <Card
                      key={account.role}
                      className="cursor-pointer border hover:border-primary/50 hover:bg-accent/50 transition-all duration-200"
                      onClick={() => handleTestAccountSelect(account)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-foreground">
                              {account.label}
                            </div>
                            <div className="text-xs text-muted-foreground/80 font-mono">
                              {account.email}
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground/60 flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
