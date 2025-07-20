import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Room } from "@shared/schema";
import { Bed, Users, Wrench, CheckCircle, XCircle, Plus, Search } from "lucide-react";

const statusColors = {
  available: "bg-green-100 text-green-800",
  occupied: "bg-red-100 text-red-800",
  maintenance: "bg-yellow-100 text-yellow-800",
  reserved: "bg-blue-100 text-blue-800"
};

const statusIcons = {
  available: CheckCircle,
  occupied: XCircle,
  maintenance: Wrench,
  reserved: Bed
};

export default function Rooms() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rooms, isLoading } = useQuery<Room[]>({
    queryKey: ["/api/rooms/1"],
  });

  const updateRoomStatusMutation = useMutation({
    mutationFn: async ({ roomId, status }: { roomId: number; status: string }) => {
      return apiRequest("PATCH", `/api/rooms/${roomId}/status`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Room status updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rooms/1"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats/1"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update room status",
        variant: "destructive",
      });
    },
  });

  const filteredRooms = rooms?.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || room.status === statusFilter;
    const matchesType = typeFilter === "all" || room.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  }) || [];

  const handleStatusChange = (roomId: number, newStatus: string) => {
    updateRoomStatusMutation.mutate({ roomId, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Room Management" />
          <main className="flex-1 overflow-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <Card key={i} className="shadow-material">
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-10 bg-gray-200 rounded w-full"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Room Management" />
        
        <main className="flex-1 overflow-auto p-6">
          {/* Filters */}
          <Card className="shadow-material mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col md:flex-row gap-4 items-center flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <Input
                      placeholder="Search rooms..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="occupied">Occupied</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="deluxe">Deluxe</SelectItem>
                      <SelectItem value="suite">Suite</SelectItem>
                      <SelectItem value="presidential">Presidential</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="mr-2" size={16} />
                  Add Room
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRooms.map((room) => {
              const StatusIcon = statusIcons[room.status as keyof typeof statusIcons];
              
              return (
                <Card key={room.id} className="shadow-material hover:shadow-material-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Room {room.roomNumber}</CardTitle>
                      <Badge className={statusColors[room.status as keyof typeof statusColors]}>
                        <StatusIcon className="mr-1" size={12} />
                        {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Bed className="mr-2" size={16} />
                        <span className="capitalize">{room.type} Room</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="mr-2" size={16} />
                        <span>Max {room.maxGuests} guests</span>
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        ${room.pricePerNight}/night
                      </div>
                    </div>
                    
                    {room.amenities && room.amenities.length > 0 && (
                      <div className="text-xs text-gray-500">
                        <p className="font-medium mb-1">Amenities:</p>
                        <p>{room.amenities.join(", ")}</p>
                      </div>
                    )}
                    
                    <div className="pt-2">
                      <Select 
                        value={room.status} 
                        onValueChange={(value) => handleStatusChange(room.id, value)}
                        disabled={updateRoomStatusMutation.isPending}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="occupied">Occupied</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="reserved">Reserved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredRooms.length === 0 && (
            <Card className="shadow-material">
              <CardContent className="p-12 text-center">
                <Bed className="mx-auto mb-4 text-gray-400" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
                <p className="text-gray-500">
                  {rooms?.length === 0 
                    ? "No rooms available in this hotel"
                    : "No rooms match your current filters"
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}