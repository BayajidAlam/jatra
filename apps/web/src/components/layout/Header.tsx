"use client";

import Link from "next/link";
import { Train, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import { useAuthStore } from "@/stores/auth-store";
import { Settings, LogOut, User, LayoutDashboard } from "lucide-react";

export default function Header() {
  const { user, isAuthenticated, logout, isLoading } = useAuthStore();
  
  // Prevent hydration mismatch/flicker by valid check or mounting check
  // But strictly for functionality:
  const showAuthLinks = !isAuthenticated && !isLoading;
  const showUserLinks = isAuthenticated && !isLoading;
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
            <Link
              href="/schedule"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Schedule
            </Link>
            {showUserLinks && (
              <>
                {user?.role !== "ADMIN" && (
                  <>
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
                  </>
                )}

              </>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <ModeToggle />
            {isLoading ? (
               <div className="w-20 h-8 bg-muted animate-pulse rounded" />
            ) : isAuthenticated ? (
              <>
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
                    {
                      [
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
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 overflow-hidden hover:opacity-80 transition-opacity">
                  <Avatar className="h-9 w-9 border dark:border-slate-700">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`} alt={user?.name} />
                    <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex w-full items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                {user?.role !== "ADMIN" && (
                  <DropdownMenuItem asChild>
                    <Link href="/my-bookings" className="flex w-full items-center">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>My Bookings</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                {user?.role === "ADMIN" && (
                    <>
                        <DropdownMenuSeparator />
                         <DropdownMenuItem asChild>
                            <Link href="/admin/dashboard" className="flex w-full items-center">
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Admin Dashboard</span>
                            </Link>
                        </DropdownMenuItem>
                    </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => logout()}
                  className="text-red-600 focus:text-red-600 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
