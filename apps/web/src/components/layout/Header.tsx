"use client";

import Link from "next/link";
import { Train, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";

export default function Header() {
  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
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
            <Link
              href="/my-tickets"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              My Tickets
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <ModeToggle />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full box-content border-2 border-background" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                  <h4 className="font-semibold text-sm">Notifications</h4>
                  <Link href="/notifications" className="text-xs text-primary hover:underline">
                    View all
                  </Link>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                    {[
                      {
                        title: "Booking Confirmed",
                        desc: "Your booking for Suborno Express is confirmed.",
                        time: "2h ago",
                        unread: true
                      },
                      {
                        title: "Payment Successful",
                        desc: "Payment of BDT 1950 received.",
                        time: "2h ago",
                        unread: true
                      },
                      {
                        title: "Train Update",
                        desc: "Suborno Express (701) departing Platform 3.",
                        time: "5h ago",
                        unread: false
                      }
                    ].map((item, i) => (
                      <div key={i} className={cn("p-4 border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer", item.unread && "bg-muted/20")}>
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-medium text-sm">{item.title}</p>
                          <span className="text-[10px] text-muted-foreground">{item.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{item.desc}</p>
                      </div>
                    ))}
                </div>
                <div className="p-2 border-t bg-muted/20">
                  <Link href="/notifications">
                    <Button variant="ghost" size="sm" className="w-full text-xs h-8">
                      View all notifications
                    </Button>
                  </Link>
                </div>
              </PopoverContent>
            </Popover>

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
