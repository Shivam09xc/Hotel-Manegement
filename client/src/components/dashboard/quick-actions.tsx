import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Plus, Bed, BarChart3, Users } from "lucide-react";

interface QuickActionsProps {
  onCreateBooking: () => void;
}

export function QuickActions({ onCreateBooking }: QuickActionsProps) {
  const [, setLocation] = useLocation();

  return (
    <Card className="shadow-material">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          className="w-full justify-start bg-primary hover:bg-primary/90" 
          onClick={onCreateBooking}
        >
          <Plus className="mr-3" size={18} />
          New Booking
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={() => setLocation("/rooms")}
        >
          <Bed className="mr-3" size={18} />
          Manage Rooms
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={() => setLocation("/staff")}
        >
          <Users className="mr-3" size={18} />
          Manage Staff
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full justify-start"
        >
          <BarChart3 className="mr-3" size={18} />
          View Reports
        </Button>
      </CardContent>
    </Card>
  );
}
