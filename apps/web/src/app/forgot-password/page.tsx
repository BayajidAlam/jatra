"use client";

import type React from "react";

import { useState } from "react";
import { Mail, Train, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // TODO: Call backend API POST /auth/forgot-password
    console.log("Forgot password request for:", identifier);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1000);
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
              <Link href="/login">
                <Button variant="outline" className="text-sm bg-transparent">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md">
          {!isSubmitted ? (
            <>
              <div className="mb-6 text-center">
                <h1 className="text-3xl font-bold mb-2">
                  Forgot your password?
                </h1>
                <p className="text-base text-muted-foreground">
                  Enter your NID, email, or phone number and we&apos;ll send you
                  a reset link
                </p>
              </div>

              <Card className="border-2">
                <CardContent className="p-6 md:p-8">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary" />
                        NID, Email, or Phone
                      </label>
                      <Input
                        type="text"
                        placeholder="Enter your NID, email, or phone number"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base"
                    >
                      {isLoading ? (
                        "Sending..."
                      ) : (
                        <>
                          Send Reset Link
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <p className="text-center text-sm text-muted-foreground mt-6">
                <Link
                  href="/login"
                  className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sign In
                </Link>
              </p>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Check your inbox</h1>
                <p className="text-base text-muted-foreground">
                  We&apos;ve sent a password reset link to your registered email
                  or phone
                </p>
              </div>

              <Card className="border-2 bg-muted/30">
                <CardContent className="p-6 md:p-8 text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Didn&apos;t receive the link? Check your spam folder or try
                    again
                  </p>
                  <div className="flex flex-col gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsSubmitted(false)}
                      className="w-full h-11 bg-transparent"
                    >
                      Try Again
                    </Button>
                    <Link href="/login" className="block">
                      <Button className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
                        Back to Sign In
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
