"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";
import { useAuth } from "@/hooks/use-auth";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const ADMIN_NOTIFICATIONS = [
  {
    id: 1,
    title: "New User Registration",
    desc: "A new user 'Tanvir' has registered with email tanvir@example.com and phone 01712345678.",
    time: "10m ago",
    unread: true,
    icon: <User className="h-4 w-4 text-blue-500" />,
    fullContent: "User details:\nName: Tanvir Ahmed\nRegistration Date: Jan 3, 2026\nIP Address: 103.23.45.12"
  },
  {
    id: 2,
    title: "System Update",
    desc: "System maintenance scheduled for 2 AM tonight.",
    time: "1h ago",
    unread: true,
    icon: <Info className="h-4 w-4 text-amber-500" />,
    fullContent: "The server will be undergoing routine maintenance starting at 02:00 UTC. Expected downtime is 15 minutes. Please backup all active sessions."
  },
  {
    id: 3,
    title: "High Value Booking",
    desc: "New booking of ৳4500 by 'Rahim'.",
    time: "3h ago",
    unread: false,
    icon: <BadgeAlert className="h-4 w-4 text-emerald-500" />,
    fullContent: "Booking ID: BK-7782\nPassenger: Rahim Uddin\nRoute: Dhaka - Chattogram\nSeats: 2 (AC_S)"
  },
  {
    id: 4,
    title: "Security Alert",
    desc: "Multiple failed login attempts from IP 192.168.1.1",
    time: "5h ago",
    unread: false,
    icon: <ShieldAlert className="h-4 w-4 text-red-500" />,
    fullContent: "Unauthorized access attempt detected.\nTarget: Admin Dashboard\nStatus: Blocked\nAction: IP Address 192.168.1.1 has been temporarily rate-limited."
  }
];

export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const paths = pathname.split("/").filter(Boolean);
  const [selectedNotification, setSelectedNotification] = React.useState<typeof ADMIN_NOTIFICATIONS[0] | null>(null);
  const [notifications, setNotifications] = React.useState(ADMIN_NOTIFICATIONS);

  const handleNotificationClick = (notif: typeof ADMIN_NOTIFICATIONS[0]) => {
    setSelectedNotification(notif);
    // Mark as read (simulated)
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, unread: false } : n));
  };

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

      <div className="flex items-center gap-2 min-w-[140px] justify-end">
        <Popover modal={false}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-red-500 border border-white dark:border-slate-900" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 shadow-xl border-slate-200 dark:border-slate-800" align="end" sideOffset={8}>
            <div className="flex items-center justify-between p-4 border-b dark:border-slate-800">
              <h4 className="font-semibold text-sm">Admin Notifications</h4>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-auto p-0 text-primary hover:bg-transparent"
                onClick={() => setNotifications(prev => prev.map(n => ({ ...n, unread: false })))}
              >
                Mark all as read
              </Button>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => handleNotificationClick(item)}
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
              {notifications.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No notifications.
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <Dialog open={!!selectedNotification} onOpenChange={(open) => !open && setSelectedNotification(null)}>
          <DialogContent className="sm:max-w-[425px] dark:bg-slate-900 dark:border-slate-800">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                {selectedNotification?.icon}
                <DialogTitle className="text-lg">{selectedNotification?.title}</DialogTitle>
              </div>
              <DialogDescription className="text-muted-foreground">
                {selectedNotification?.time}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm font-medium mb-2">{selectedNotification?.desc}</p>
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border dark:border-slate-800 whitespace-pre-wrap font-mono text-xs">
                {selectedNotification?.fullContent}
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setSelectedNotification(null)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        <ModeToggle />
        
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 overflow-hidden hover:opacity-80 transition-opacity">
              <Avatar className="h-9 w-9 border dark:border-slate-700">
                <AvatarImage src="https://github.com/shadcn.png" alt="Admin" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
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
            <DropdownMenuItem 
              onClick={async () => {
                await logout();
                router.push("/login");
              }}
              className="text-red-600 focus:text-red-600 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
