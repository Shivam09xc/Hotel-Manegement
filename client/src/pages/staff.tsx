import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Staff } from "@shared/schema";
import { Users, Plus, Search, Mail, Phone, Calendar, DollarSign } from "lucide-react";

export default function StaffManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    salary: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: staff, isLoading } = useQuery<Staff[]>({
    queryKey: ["/api/staff/1"],
  });

  const addStaffMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/staff", {
        ...data,
        hotelId: 1,
        hireDate: new Date().toISOString(),
        salary: data.salary ? parseFloat(data.salary) : null,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Staff member added successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/staff/1"] });
      setIsAddModalOpen(false);
      setNewStaff({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        position: "",
        department: "",
        salary: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add staff member",
        variant: "destructive",
      });
    },
  });

  const filteredStaff = staff?.filter(member => {
    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || member.department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  }) || [];

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newStaff.firstName || !newStaff.lastName || !newStaff.email || 
        !newStaff.phone || !newStaff.position || !newStaff.department) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    addStaffMutation.mutate(newStaff);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Staff Management" />
          <main className="flex-1 overflow-auto p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="shadow-material">
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
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
        <Header title="Staff Management" />
        
        <main className="flex-1 overflow-auto p-6">
          {/* Filters and Add Button */}
          <Card className="shadow-material mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col md:flex-row gap-4 items-center flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <Input
                      placeholder="Search staff..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="reception">Reception</SelectItem>
                      <SelectItem value="housekeeping">Housekeeping</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="management">Management</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90">
                      <Plus className="mr-2" size={16} />
                      Add Staff Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Staff Member</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddStaff} className="space-y-4 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            value={newStaff.firstName}
                            onChange={(e) => setNewStaff(prev => ({ ...prev, firstName: e.target.value }))}
                            placeholder="Enter first name"
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            value={newStaff.lastName}
                            onChange={(e) => setNewStaff(prev => ({ ...prev, lastName: e.target.value }))}
                            placeholder="Enter last name"
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newStaff.email}
                            onChange={(e) => setNewStaff(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="Enter email"
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="phone">Phone *</Label>
                          <Input
                            id="phone"
                            value={newStaff.phone}
                            onChange={(e) => setNewStaff(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="Enter phone number"
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="position">Position *</Label>
                          <Select value={newStaff.position} onValueChange={(value) => setNewStaff(prev => ({ ...prev, position: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select position" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="receptionist">Receptionist</SelectItem>
                              <SelectItem value="housekeeper">Housekeeper</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                              <SelectItem value="security">Security</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="department">Department *</Label>
                          <Select value={newStaff.department} onValueChange={(value) => setNewStaff(prev => ({ ...prev, department: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="reception">Reception</SelectItem>
                              <SelectItem value="housekeeping">Housekeeping</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                              <SelectItem value="security">Security</SelectItem>
                              <SelectItem value="management">Management</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="md:col-span-2">
                          <Label htmlFor="salary">Salary (Optional)</Label>
                          <Input
                            id="salary"
                            type="number"
                            value={newStaff.salary}
                            onChange={(e) => setNewStaff(prev => ({ ...prev, salary: e.target.value }))}
                            placeholder="Enter salary amount"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-end space-x-4 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={addStaffMutation.isPending}
                        >
                          {addStaffMutation.isPending ? "Adding..." : "Add Staff Member"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Staff List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredStaff.map((member) => (
              <Card key={member.id} className="shadow-material hover:shadow-material-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={`https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=50&h=50&fit=crop&crop=face`}
                        alt={`${member.firstName} ${member.lastName}`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {member.firstName} {member.lastName}
                        </h3>
                        <p className="text-sm text-gray-500 capitalize">{member.position}</p>
                      </div>
                    </div>
                    <Badge className={member.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {member.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="mr-2" size={14} />
                      <span>{member.email}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="mr-2" size={14} />
                      <span>{member.phone}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="mr-2" size={14} />
                      <span className="capitalize">{member.department} Department</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="mr-2" size={14} />
                      <span>Hired: {new Date(member.hireDate).toLocaleDateString()}</span>
                    </div>
                    {member.salary && (
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="mr-2" size={14} />
                        <span>${parseFloat(member.salary).toLocaleString()}/year</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Edit
                      </Button>
                      <Button 
                        variant={member.isActive ? "destructive" : "default"} 
                        size="sm" 
                        className="flex-1"
                      >
                        {member.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredStaff.length === 0 && (
            <Card className="shadow-material">
              <CardContent className="p-12 text-center">
                <Users className="mx-auto mb-4 text-gray-400" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members found</h3>
                <p className="text-gray-500">
                  {staff?.length === 0 
                    ? "No staff members have been added yet"
                    : "No staff members match your current filters"
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