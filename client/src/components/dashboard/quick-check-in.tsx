import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { UserCheck, Search } from "lucide-react";

export function QuickCheckIn() {
  const [bookingId, setBookingId] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const checkInMutation = useMutation({
    mutationFn: async (data: { bookingId?: string; guestEmail?: string }) => {
      // This would normally search for the booking and update its status
      return apiRequest("PATCH", `/api/bookings/${data.bookingId}/status`, { 
        status: "checked_in" 
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Guest checked in successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings/recent/1"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats/1"] });
      setBookingId("");
      setGuestEmail("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to check in guest",
        variant: "destructive",
      });
    },
  });

  const handleCheckIn = () => {
    if (!bookingId && !guestEmail) {
      toast({
        title: "Error",
        description: "Please enter either a booking ID or guest email",
        variant: "destructive",
      });
      return;
    }

    checkInMutation.mutate({ bookingId, guestEmail });
  };

  return (
    <Card className="shadow-material">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-500 bg-opacity-10 rounded-lg flex items-center justify-center">
            <UserCheck className="text-green-500" size={20} />
          </div>
          <CardTitle>Quick Check-in</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            placeholder="Booking ID"
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
          />
        </div>
        
        <div className="text-center text-sm text-gray-500">or</div>
        
        <div>
          <Input
            placeholder="Guest email"
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
          />
        </div>
        
        <Button 
          className="w-full bg-green-500 hover:bg-green-600" 
          onClick={handleCheckIn}
          disabled={checkInMutation.isPending}
        >
          {checkInMutation.isPending ? "Checking in..." : "Check In Guest"}
        </Button>
      </CardContent>
    </Card>
  );
}