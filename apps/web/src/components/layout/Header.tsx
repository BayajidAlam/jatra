"use client"

import Link from "next/link";
import { Train } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Train className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold text-foreground">
              Jatra Railway
            </span>
          </Link>

            <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/search-trains"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Search Trains
            </Link>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Schedule
            </a>
            <Link
              href="/my-bookings"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              My Bookings
            </Link>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              My Tickets
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="hidden md:inline-flex text-sm">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="text-sm bg-primary hover:bg-primary/90">
                Register
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
