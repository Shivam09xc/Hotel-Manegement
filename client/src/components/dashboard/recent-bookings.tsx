import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PopulatedBooking } from "@/lib/types";

const statusColors = {
  confirmed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  checked_in: "bg-blue-100 text-blue-800",
  checked_out: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800"
};

export function RecentBookings() {
  const { data: bookings, isLoading } = useQuery<PopulatedBooking[]>({
    queryKey: ["/api/bookings/recent/1?limit=5"],
  });

  if (isLoading) {
    return (
      <Card className="shadow-material">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Bookings</CardTitle>
            <Button variant="link" className="text-primary">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse flex items-center space-x-4 py-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <Card className="shadow-material">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Bookings</CardTitle>
            <Button variant="link" className="text-primary">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">No recent bookings found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-material">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Bookings</CardTitle>
          <Button variant="link" className="text-primary">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 text-sm font-medium text-gray-500">Guest</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Room</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Check-in</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={`https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=40&h=40&fit=crop&crop=face`}
                        alt="Guest Avatar" 
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {booking.guest?.name || "Unknown Guest"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {booking.guest?.email || "No email"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-gray-900">
                    {booking.room?.type || "Unknown"} {booking.room?.number}
                  </td>
                  <td className="py-4 text-gray-600">
                    {new Date(booking.checkInDate).toLocaleDateString()}
                  </td>
                  <td className="py-4">
                    <Badge 
                      className={statusColors[booking.status as keyof typeof statusColors] || statusColors.pending}
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="py-4 font-medium text-gray-900">
                    ${booking.totalAmount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
