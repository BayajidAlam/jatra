"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Train,
  MapPin,
  Route,
  Calendar,
  Ticket,
  Users,
  ShoppingCart,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Trains",
    href: "/admin/trains",
    icon: Train,
  },
  {
    title: "Stations",
    href: "/admin/stations",
    icon: MapPin,
  },
  {
    title: "Routes",
    href: "/admin/routes",
    icon: Route,
  },
  {
    title: "Schedules",
    href: "/admin/schedules",
    icon: Calendar,
  },
  {
    title: "Bookings",
    href: "/admin/bookings",
    icon: Ticket,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "relative flex flex-col border-r transition-all duration-300 shadow-xl z-20",
        "bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950",
        "text-slate-900 dark:text-slate-100",
        "border-slate-200 dark:border-slate-800",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight">
            Jatra Admin
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto hover:bg-slate-100 dark:hover:bg-slate-800"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="grid gap-1 px-2">
          {sidebarItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  "hover:bg-slate-100 dark:hover:bg-slate-800",
                  isActive
                    ? "bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-white"
                    : "text-slate-600 dark:text-slate-400",
                  collapsed && "justify-center px-2"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "text-blue-400")} />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 p-2">
        <nav className="grid gap-1 px-2">
          <Link
            href="/admin/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800",
              collapsed && "justify-center px-2"
            )}
          >
            <Settings className="h-5 w-5" />
            {!collapsed && <span>Settings</span>}
          </Link>
           <button
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-950/20",
              collapsed && "justify-center px-2"
            )}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span>Logout</span>}
          </button>
        </nav>
      </div>
    </div>
  );
}
