"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Train, Calendar, CreditCard, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Train className="w-16 h-16 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
              <Train className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-blue-900">Jatra Railway</h1>
              <p className="text-xs text-gray-600">Smart Booking System</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-600">{user.email}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 mb-8 text-white">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {user.name?.split(" ")[0]}! 👋
          </h2>
          <p className="text-blue-100">
            Ready to book your next railway journey?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-blue-500 group">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                <Calendar className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <h4 className="font-bold text-lg text-gray-900 mb-1">
                Search Trains
              </h4>
              <p className="text-sm text-gray-600">
                Find and book your next journey
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-orange-500 group">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-orange-500 transition-colors">
                <Train className="w-6 h-6 text-orange-500 group-hover:text-white transition-colors" />
              </div>
              <h4 className="font-bold text-lg text-gray-900 mb-1">
                My Bookings
              </h4>
              <p className="text-sm text-gray-600">View your booking history</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-blue-500 group">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                <CreditCard className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <h4 className="font-bold text-lg text-gray-900 mb-1">Payments</h4>
              <p className="text-sm text-gray-600">View payment history</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-orange-500 group">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-orange-500 transition-colors">
                <User className="w-6 h-6 text-orange-500 group-hover:text-white transition-colors" />
              </div>
              <h4 className="font-bold text-lg text-gray-900 mb-1">Profile</h4>
              <p className="text-sm text-gray-600">Manage your account</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Recent Activity
          </h3>
          <p className="text-gray-600 mb-6">
            Your recent bookings and activities
          </p>

          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Train className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-6">
              No recent activity. Start by searching for trains!
            </p>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <Calendar className="w-4 h-4" />
              <span>Search Trains</span>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
