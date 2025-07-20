import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentBookings } from "@/components/dashboard/recent-bookings";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RoomStatus } from "@/components/dashboard/room-status";
import { TodayTasks } from "@/components/dashboard/today-tasks";
import { QuickCheckIn } from "@/components/dashboard/quick-check-in";
import { BookingModal } from "@/components/modals/booking-modal";
import { useState } from "react";

export default function Dashboard() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-auto p-6">
          <StatsCards />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RecentBookings />
            </div>
            
            <div className="space-y-6">
              <QuickActions onCreateBooking={() => setIsBookingModalOpen(true)} />
              <QuickCheckIn />
              <RoomStatus />
              <TodayTasks />
            </div>
          </div>
        </main>
      </div>
      
      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
      />
    </div>
  );
}
