import { Link, useLocation } from "wouter";
import { 
  Hotel, 
  LayoutDashboard, 
  Calendar, 
  Bed, 
  Users, 
  Bus, 
  BarChart3, 
  CreditCard, 
  Settings 
} from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/", badge: null },
  { icon: Calendar, label: "Bookings", href: "/bookings", badge: "3" },
  { icon: Bed, label: "Rooms", href: "/rooms", badge: null },
  { icon: Bus, label: "Staff", href: "/staff", badge: null },
  { icon: Users, label: "Profile", href: "/profile", badge: null },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white shadow-material flex-shrink-0 hidden lg:block">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Hotel className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">HotelPro</h1>
            <p className="text-sm text-gray-500">Management Suite</p>
          </div>
        </div>
      </div>
      
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.href} href={item.href}>
              <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors duration-200 cursor-pointer ${
                isActive 
                  ? "bg-primary text-white" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}>
                <Icon size={18} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>
      
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-gradient-to-r from-primary to-blue-600 text-white p-4 rounded-lg">
          <h3 className="font-semibold text-sm">Hotel Management</h3>
          <p className="text-xs opacity-90 mt-1">Complete hotel operations suite</p>
          <Button 
            size="sm" 
            className="mt-3 bg-white text-primary hover:bg-gray-100"
          >
            Upgrade Now
          </Button>
        </div>
      </div>
    </aside>
  );
}
