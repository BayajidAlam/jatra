"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, LogOut, User, Bell, Info, ShieldAlert, BadgeAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function AdminHeader() {
  const pathname = usePathname();
  const paths = pathname.split("/").filter(Boolean);

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
      <div className="flex items-center gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/admin/dashboard">Admin</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {paths.slice(1).map((path, index) => {
              const isLast = index === paths.length - 2;
              const href = `/${paths.slice(0, index + 2).join("/")}`;
              const label = path.charAt(0).toUpperCase() + path.slice(1);

              return (
                <React.Fragment key={path}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={href}>{label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-red-500 border border-white dark:border-slate-900" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex items-center justify-between p-4 border-b dark:border-slate-800">
              <h4 className="font-semibold text-sm">Admin Notifications</h4>
              <Link href="/admin/settings" className="text-xs text-primary hover:underline">
                Settings
              </Link>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {[
                {
                  title: "New User Registration",
                  desc: "A new user 'Tanvir' has registered.",
                  time: "10m ago",
                  unread: true,
                  icon: <User className="h-4 w-4 text-blue-500" />
                },
                {
                  title: "System Update",
                  desc: "System maintenance scheduled for 2 AM.",
                  time: "1h ago",
                  unread: true,
                  icon: <Info className="h-4 w-4 text-amber-500" />
                },
                {
                  title: "High Value Booking",
                  desc: "New booking of ৳4500 by 'Rahim'.",
                  time: "3h ago",
                  unread: false,
                  icon: <BadgeAlert className="h-4 w-4 text-emerald-500" />
                },
                {
                  title: "Security Alert",
                  desc: "Multiple failed login attempts from IP 192.168.1.1",
                  time: "5h ago",
                  unread: false,
                  icon: <ShieldAlert className="h-4 w-4 text-red-500" />
                }
              ].map((item, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex gap-3 p-4 border-b dark:border-slate-800 last:border-0 hover:bg-muted/50 transition-colors cursor-pointer", 
                    item.unread && "bg-blue-50/50 dark:bg-blue-900/10"
                  )}
                >
                  <div className="mt-1">{item.icon}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-medium text-sm">{item.title}</p>
                      <span className="text-[10px] text-muted-foreground">{item.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-2 border-t dark:border-slate-800 bg-muted/20">
              <Button variant="ghost" size="sm" className="w-full text-xs h-8">
                Mark all as read
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        <ModeToggle />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9 border dark:border-slate-700">
                <AvatarImage src="https://github.com/shadcn.png" alt="Admin" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Admin User</p>
                <p className="text-xs leading-none text-muted-foreground">
                  admin@jatra.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/settings" className="flex w-full items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/settings" className="flex w-full items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
