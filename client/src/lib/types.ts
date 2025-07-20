export interface DashboardStats {
  totalBookings: number;
  occupancyRate: number;
  revenue: number;
  availableRooms: number;
  totalRooms: number;
  occupiedRooms: number;
  maintenanceRooms: number;
  reservedRooms: number;
}

export interface PopulatedBooking {
  id: number;
  hotelId: number;
  roomId: number;
  guestId: number;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: string;
  status: string;
  numberOfGuests: number;
  specialRequests: string | null;
  paymentStatus: string;
  createdAt: string;
  guest: {
    name: string;
    email: string;
  } | null;
  room: {
    number: string;
    type: string;
  } | null;
}
