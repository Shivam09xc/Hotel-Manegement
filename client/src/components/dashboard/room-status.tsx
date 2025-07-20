import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardStats } from "@/lib/types";

const statusConfig = [
  { key: "availableRooms", label: "Available", color: "bg-green-500" },
  { key: "occupiedRooms", label: "Occupied", color: "bg-red-500" },
  { key: "maintenanceRooms", label: "Maintenance", color: "bg-yellow-500" },
  { key: "reservedRooms", label: "Reserved", color: "bg-blue-500" },
];

export function RoomStatus() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats/1"],
  });

  if (isLoading) {
    return (
      <Card className="shadow-material">
        <CardHeader>
          <CardTitle>Room Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-8"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className="shadow-material">
        <CardHeader>
          <CardTitle>Room Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Failed to load room status</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-material">
      <CardHeader>
        <CardTitle>Room Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {statusConfig.map((status) => (
          <div key={status.key} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 ${status.color} rounded-full`}></div>
              <span className="text-gray-700">{status.label}</span>
            </div>
            <span className="font-semibold text-gray-900">
              {stats[status.key as keyof DashboardStats]}
            </span>
          </div>
        ))}
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Total Rooms</span>
            <span className="font-semibold text-gray-900">{stats.totalRooms}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
