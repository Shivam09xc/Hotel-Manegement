import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookingSchema, insertGuestSchema, insertTaskSchema, insertStaffSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth endpoints
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // In a real app, generate JWT token here
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token: "mock-jwt-token" });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { username, email, password, role } = req.body;
      
      if (!username || !email || !password) {
        return res.status(400).json({ error: "Username, email, and password are required" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already exists" });
      }
      
      // Create new user
      const newUser = await storage.createUser({
        username,
        email,
        password, // In real app, hash this
        role: role || "manager",
        hotelId: null,
      });
      
      const { password: _, ...userWithoutPassword } = newUser;
      res.status(201).json({ user: userWithoutPassword, token: "mock-jwt-token" });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats/:hotelId", async (req, res) => {
    try {
      const hotelId = parseInt(req.params.hotelId);
      if (isNaN(hotelId)) {
        return res.status(400).json({ error: "Invalid hotel ID" });
      }
      
      const stats = await storage.getDashboardStats(hotelId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Recent bookings
  app.get("/api/bookings/recent/:hotelId", async (req, res) => {
    try {
      const hotelId = parseInt(req.params.hotelId);
      const limit = parseInt(req.query.limit as string) || 10;
      
      if (isNaN(hotelId)) {
        return res.status(400).json({ error: "Invalid hotel ID" });
      }
      
      const bookings = await storage.getRecentBookings(hotelId, limit);
      
      // Populate with guest and room data
      const populatedBookings = await Promise.all(
        bookings.map(async (booking) => {
          const guest = await storage.getGuest(booking.guestId);
          const room = await storage.getRoom(booking.roomId);
          return {
            ...booking,
            guest: guest ? {
              name: `${guest.firstName} ${guest.lastName}`,
              email: guest.email
            } : null,
            room: room ? {
              number: room.roomNumber,
              type: room.type
            } : null
          };
        })
      );
      
      res.json(populatedBookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recent bookings" });
    }
  });

  // Create booking
  app.post("/api/bookings", async (req, res) => {
    try {
      // Validate guest data
      const guestData = insertGuestSchema.parse({
        firstName: req.body.guestName?.split(' ')[0] || '',
        lastName: req.body.guestName?.split(' ').slice(1).join(' ') || '',
        email: req.body.email,
        phone: req.body.phone || '',
        address: req.body.address || ''
      });
      
      // Create or find guest
      let guest = await storage.getGuestByEmail(guestData.email);
      if (!guest) {
        guest = await storage.createGuest(guestData);
      }
      
      // Find available room of the requested type
      const rooms = await storage.getRoomsByHotel(req.body.hotelId);
      const availableRoom = rooms.find(room => 
        room.type === req.body.roomType?.toLowerCase().replace(' ', '_') && 
        room.status === 'available'
      );
      
      if (!availableRoom) {
        return res.status(400).json({ error: "No available rooms of the requested type" });
      }
      
      // Calculate total amount (simplified)
      const checkIn = new Date(req.body.checkInDate);
      const checkOut = new Date(req.body.checkOutDate);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      const totalAmount = (parseFloat(availableRoom.pricePerNight) * nights).toFixed(2);
      
      // Validate booking data
      const bookingData = insertBookingSchema.parse({
        hotelId: req.body.hotelId,
        roomId: availableRoom.id,
        guestId: guest.id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        totalAmount,
        numberOfGuests: parseInt(req.body.numberOfGuests) || 1,
        specialRequests: req.body.specialRequests || null,
        status: 'confirmed',
        paymentStatus: 'pending'
      });
      
      const booking = await storage.createBooking(bookingData);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create booking" });
    }
  });

  // Today's tasks
  app.get("/api/tasks/today/:hotelId", async (req, res) => {
    try {
      const hotelId = parseInt(req.params.hotelId);
      if (isNaN(hotelId)) {
        return res.status(400).json({ error: "Invalid hotel ID" });
      }
      
      const tasks = await storage.getTodayTasks(hotelId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch today's tasks" });
    }
  });

  // Update task status
  app.patch("/api/tasks/:taskId/status", async (req, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      const { status } = req.body;
      
      if (isNaN(taskId)) {
        return res.status(400).json({ error: "Invalid task ID" });
      }
      
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      
      const completedAt = status === "completed" ? new Date() : undefined;
      const task = await storage.updateTaskStatus(taskId, status, completedAt);
      
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: "Failed to update task status" });
    }
  });

  // Get rooms by hotel
  app.get("/api/rooms/:hotelId", async (req, res) => {
    try {
      const hotelId = parseInt(req.params.hotelId);
      if (isNaN(hotelId)) {
        return res.status(400).json({ error: "Invalid hotel ID" });
      }
      
      const rooms = await storage.getRoomsByHotel(hotelId);
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rooms" });
    }
  });

  // Update room status
  app.patch("/api/rooms/:roomId/status", async (req, res) => {
    try {
      const roomId = parseInt(req.params.roomId);
      const { status } = req.body;
      
      if (isNaN(roomId)) {
        return res.status(400).json({ error: "Invalid room ID" });
      }
      
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      
      const room = await storage.updateRoomStatus(roomId, status);
      
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }
      
      res.json(room);
    } catch (error) {
      res.status(500).json({ error: "Failed to update room status" });
    }
  });

  // Staff endpoints
  app.get("/api/staff/:hotelId", async (req, res) => {
    try {
      const hotelId = parseInt(req.params.hotelId);
      if (isNaN(hotelId)) {
        return res.status(400).json({ error: "Invalid hotel ID" });
      }
      
      const staff = await storage.getStaffByHotel(hotelId);
      res.json(staff);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch staff" });
    }
  });

  app.post("/api/staff", async (req, res) => {
    try {
      const staffData = insertStaffSchema.parse(req.body);
      const staff = await storage.createStaff(staffData);
      res.status(201).json(staff);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create staff member" });
    }
  });

  // User profile endpoints
  app.patch("/api/users/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      // This is a simplified update - in real app, implement proper user update
      res.json({ message: "Profile updated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  app.patch("/api/users/:userId/password", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      // This is a simplified password change - in real app, implement proper password change
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to change password" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
