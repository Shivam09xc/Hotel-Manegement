import { Menu, Search, Bell, ChevronDown, User, LogOut, Home, LayoutDashboard, Calendar, Bed, Bus } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/components/auth/auth-guard";
import { useState } from "react";

interface HeaderProps {
  title?: string;
}

export function Header({ title = "Dashboard" }: HeaderProps) {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleProfileClick = () => {
    setLocation("/profile");
  };

  const handleHomeClick = () => {
    setLocation("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      // Add your search logic here
      alert(`Searching for: ${searchQuery}`);
    }
  };

  const notifications = [
    { id: 1, title: "New booking received", message: "Room 205 booked for tonight", time: "2 min ago", type: "booking" },
    { id: 2, title: "Check-out reminder", message: "Guest in room 102 checking out today", time: "1 hour ago", type: "checkout" },
    { id: 3, title: "Maintenance request", message: "AC repair needed in room 301", time: "3 hours ago", type: "maintenance" }
  ];

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between relative">
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-600 hover:text-gray-900"
          onClick={handleHomeClick}
        >
          <Home size={20} />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="lg:hidden text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <Menu size={24} />
        </Button>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>
      
      <div className="flex items-center space-x-6">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input 
            placeholder="Search rooms, guests, bookings..." 
            className="w-80 pl-10 pr-4 py-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
        
        {/* Notifications */}
        <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-600 hover:text-gray-900 relative"
              onClick={handleNotificationClick}
            >
              <Bell size={20} />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {notifications.length}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <p className="text-sm text-gray-500">{notifications.length} new notifications</p>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className="p-4 cursor-pointer">
                  <div className="w-full">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-sm text-gray-900">{notification.title}</h4>
                      <span className="text-xs text-gray-500">{notification.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
            <div className="p-2 border-t">
              <Button variant="ghost" className="w-full text-sm">
                View all notifications
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-3 px-3 py-2 h-auto">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=50&h=50" 
                alt="User Avatar" 
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">{user?.username || "User"}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role || "Member"}</p>
              </div>
              <ChevronDown size={16} className="text-gray-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={handleProfileClick}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t z-50">
          <nav className="p-4 space-y-2">
            <button 
              onClick={() => {
                setLocation("/");
                setShowMobileMenu(false);
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg text-left"
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>
            <button 
              onClick={() => {
                setLocation("/bookings");
                setShowMobileMenu(false);
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg text-left"
            >
              <Calendar size={18} />
              <span>Bookings</span>
            </button>
            <button 
              onClick={() => {
                setLocation("/rooms");
                setShowMobileMenu(false);
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg text-left"
            >
              <Bed size={18} />
              <span>Rooms</span>
            </button>
            <button 
              onClick={() => {
                setLocation("/staff");
                setShowMobileMenu(false);
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg text-left"
            >
              <Bus size={18} />
              <span>Staff</span>
            </button>
            <button 
              onClick={() => {
                setLocation("/profile");
                setShowMobileMenu(false);
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg text-left"
            >
              <User size={18} />
              <span>Profile</span>
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
