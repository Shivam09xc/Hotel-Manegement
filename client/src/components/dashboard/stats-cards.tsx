import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Bed, DollarSign, DoorOpen, TrendingUp } from "lucide-react";
import type { DashboardStats } from "@/lib/types";

const statsConfig = [
  {
    key: "totalBookings" as keyof DashboardStats,
    title: "Total Bookings",
    icon: Calendar,
    color: "text-primary",
    bgColor: "bg-primary bg-opacity-10"
  },
  {
    key: "occupancyRate" as keyof DashboardStats,
    title: "Occupancy Rate",
    icon: Bed,
    color: "text-orange-500",
    bgColor: "bg-orange-500 bg-opacity-10",
    format: (value: number) => `${value}%`
  },
  {
    key: "revenue" as keyof DashboardStats,
    title: "Revenue",
    icon: DollarSign,
    color: "text-green-500",
    bgColor: "bg-green-500 bg-opacity-10",
    format: (value: number) => `$${value.toLocaleString()}`
  },
  {
    key: "availableRooms" as keyof DashboardStats,
    title: "Available Rooms",
    icon: DoorOpen,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500 bg-opacity-10"
  }
];

export function StatsCards() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats/1"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="shadow-material">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-material">
          <CardContent className="p-6">
            <p className="text-red-500">Failed to load dashboard stats</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsConfig.map((config) => {
        const Icon = config.icon;
        const value = stats[config.key];
        const displayValue = config.format ? config.format(value as number) : value;
        
        return (
          <Card key={config.key} className="shadow-material">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{config.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{displayValue}</p>
                  <p className="text-sm text-green-600 mt-2 flex items-center">
                    <TrendingUp size={14} className="mr-1" />
                    12% vs last month
                  </p>
                </div>
                <div className={`w-12 h-12 ${config.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={config.color} size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
