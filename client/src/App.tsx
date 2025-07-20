import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthGuard } from "@/components/auth/auth-guard";
import Dashboard from "@/pages/dashboard";
import Bookings from "@/pages/bookings";
import Rooms from "@/pages/rooms";
import StaffManagement from "@/pages/staff";
import Profile from "@/pages/profile";
import Login from "@/pages/auth/login";
import Signup from "@/pages/auth/signup";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}

function Router() {
  const [location] = useLocation();
  
  // Don't show auth guard for auth pages
  if (location.startsWith('/auth/')) {
    return (
      <Switch>
        <Route path="/auth/login" component={Login} />
        <Route path="/auth/signup" component={Signup} />
        <Route component={NotFound} />
      </Switch>
    );
  }
  
  return (
    <ProtectedRoute>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/bookings" component={Bookings} />
        <Route path="/rooms" component={Rooms} />
        <Route path="/staff" component={StaffManagement} />
        <Route path="/profile" component={Profile} />
        <Route component={NotFound} />
      </Switch>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
