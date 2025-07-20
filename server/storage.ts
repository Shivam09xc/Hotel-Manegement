import { 
  users, hotels, rooms, guests, bookings, staff, tasks,
  type User, type Hotel, type Room, type Guest, type Booking, type Staff, type Task,
  type InsertUser, type InsertHotel, type InsertRoom, type InsertGuest, 
  type InsertBooking, type InsertStaff, type InsertTask 
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lt } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Hotels
  getHotel(id: number): Promise<Hotel | undefined>;
  getHotelsByOwner(ownerId: number): Promise<Hotel[]>;
  createHotel(hotel: InsertHotel): Promise<Hotel>;
  
  // Rooms
  getRoom(id: number): Promise<Room | undefined>;
  getRoomsByHotel(hotelId: number): Promise<Room[]>;
  getRoomByNumber(hotelId: number, roomNumber: string): Promise<Room | undefined>;
  createRoom(room: InsertRoom): Promise<Room>;
  updateRoomStatus(roomId: number, status: string): Promise<Room | undefined>;
  
  // Guests
  getGuest(id: number): Promise<Guest | undefined>;
  getGuestByEmail(email: string): Promise<Guest | undefined>;
  createGuest(guest: InsertGuest): Promise<Guest>;
  
  // Bookings
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingsByHotel(hotelId: number): Promise<Booking[]>;
  getRecentBookings(hotelId: number, limit?: number): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(bookingId: number, status: string): Promise<Booking | undefined>;
  
  // Staff
  getStaff(id: number): Promise<Staff | undefined>;
  getStaffByHotel(hotelId: number): Promise<Staff[]>;
  createStaff(staff: InsertStaff): Promise<Staff>;
  
  // Tasks
  getTask(id: number): Promise<Task | undefined>;
  getTasksByHotel(hotelId: number): Promise<Task[]>;
  getTodayTasks(hotelId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTaskStatus(taskId: number, status: string, completedAt?: Date): Promise<Task | undefined>;
  
  // Dashboard stats
  getDashboardStats(hotelId: number): Promise<{
    totalBookings: number;
    occupancyRate: number;
    revenue: number;
    availableRooms: number;
    totalRooms: number;
    occupiedRooms: number;
    maintenanceRooms: number;
    reservedRooms: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private hotels: Map<number, Hotel>;
  private rooms: Map<number, Room>;
  private guests: Map<number, Guest>;
  private bookings: Map<number, Booking>;
  private staff: Map<number, Staff>;
  private tasks: Map<number, Task>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.hotels = new Map();
    this.rooms = new Map();
    this.guests = new Map();
    this.bookings = new Map();
    this.staff = new Map();
    this.tasks = new Map();
    this.currentId = 1;
    this.seedData();
  }

  private seedData() {
    // Create default user and hotel
    const defaultUser: User = {
      id: 1,
      username: "admin",
      password: "admin123", // In real app, this should be hashed
      email: "admin@hotelpro.com",
      role: "admin",
      hotelId: 1,
      createdAt: new Date(),
    };
    this.users.set(1, defaultUser);

    const defaultHotel: Hotel = {
      id: 1,
      name: "Grand Plaza Hotel",
      address: "123 Downtown Ave, City Center",
      phone: "+1 (555) 123-4567",
      email: "info@grandplaza.com",
      totalRooms: 180,
      ownerId: 1,
      createdAt: new Date(),
    };
    this.hotels.set(1, defaultHotel);

    // Create sample rooms
    const roomTypes = ["standard", "deluxe", "suite", "presidential"];
    const roomPrices = { standard: "120.00", deluxe: "180.00", suite: "350.00", presidential: "800.00" };
    
    for (let i = 1; i <= 180; i++) {
      const roomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];
      const status = i <= 142 ? "occupied" : i <= 150 ? "maintenance" : i <= 157 ? "reserved" : "available";
      
      const room: Room = {
        id: i,
        hotelId: 1,
        roomNumber: String(100 + i),
        type: roomType,
        status,
        pricePerNight: roomPrices[roomType as keyof typeof roomPrices],
        maxGuests: roomType === "presidential" ? 6 : roomType === "suite" ? 4 : 2,
        amenities: ["wifi", "tv", "ac", "minibar"],
        createdAt: new Date(),
      };
      this.rooms.set(i, room);
    }

    // Create sample guests
    const sampleGuests = [
      { firstName: "Sarah", lastName: "Johnson", email: "sarah@example.com", phone: "+1-555-0101" },
      { firstName: "Emily", lastName: "Chen", email: "emily.chen@example.com", phone: "+1-555-0102" },
      { firstName: "Michael", lastName: "Brown", email: "m.brown@example.com", phone: "+1-555-0103" },
    ];

    sampleGuests.forEach((guest, index) => {
      const guestRecord: Guest = {
        id: index + 1,
        ...guest,
        address: "123 Main St, Anytown, USA",
        idType: "passport",
        idNumber: `P${1000000 + index}`,
        createdAt: new Date(),
      };
      this.guests.set(index + 1, guestRecord);
    });

    // Create sample bookings
    const sampleBookings = [
      { guestId: 1, roomId: 104, amount: "420.00", status: "confirmed", checkIn: new Date("2023-12-15"), checkOut: new Date("2023-12-18") },
      { guestId: 2, roomId: 156, amount: "280.00", status: "pending", checkIn: new Date("2023-12-16"), checkOut: new Date("2023-12-19") },
      { guestId: 3, roomId: 301, amount: "580.00", status: "checked_in", checkIn: new Date("2023-12-18"), checkOut: new Date("2023-12-21") },
    ];

    sampleBookings.forEach((booking, index) => {
      const bookingRecord: Booking = {
        id: index + 1,
        hotelId: 1,
        roomId: booking.roomId,
        guestId: booking.guestId,
        checkInDate: booking.checkIn,
        checkOutDate: booking.checkOut,
        totalAmount: booking.amount,
        status: booking.status,
        numberOfGuests: 1,
        specialRequests: null,
        paymentStatus: booking.status === "confirmed" ? "paid" : "pending",
        createdAt: new Date(),
      };
      this.bookings.set(index + 1, bookingRecord);
    });

    // Create sample staff
    const sampleStaff = [
      { firstName: "Alice", lastName: "Johnson", email: "alice@grandplaza.com", phone: "+1-555-0201", position: "receptionist", department: "reception", salary: "35000" },
      { firstName: "Bob", lastName: "Smith", email: "bob@grandplaza.com", phone: "+1-555-0202", position: "housekeeper", department: "housekeeping", salary: "28000" },
      { firstName: "Carol", lastName: "Davis", email: "carol@grandplaza.com", phone: "+1-555-0203", position: "maintenance", department: "maintenance", salary: "42000" },
      { firstName: "David", lastName: "Wilson", email: "david@grandplaza.com", phone: "+1-555-0204", position: "security", department: "security", salary: "38000" },
      { firstName: "Emma", lastName: "Brown", email: "emma@grandplaza.com", phone: "+1-555-0205", position: "manager", department: "management", salary: "65000" },
    ];

    sampleStaff.forEach((staff, index) => {
      const staffRecord: Staff = {
        id: index + 1,
        hotelId: 1,
        firstName: staff.firstName,
        lastName: staff.lastName,
        email: staff.email,
        phone: staff.phone,
        position: staff.position,
        department: staff.department,
        salary: staff.salary,
        hireDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        isActive: true,
        createdAt: new Date(),
      };
      this.staff.set(index + 1, staffRecord);
    });

    // Create sample tasks
    const sampleTasks = [
      { title: "Room 205 cleaning", status: "pending", priority: "medium" },
      { title: "Update booking rates", status: "completed", priority: "low" },
      { title: "Staff meeting at 3 PM", status: "pending", priority: "high" },
      { title: "Review maintenance requests", status: "pending", priority: "medium" },
    ];

    sampleTasks.forEach((task, index) => {
      const taskRecord: Task = {
        id: index + 1,
        hotelId: 1,
        title: task.title,
        description: null,
        assignedTo: 1,
        status: task.status,
        priority: task.priority,
        dueDate: new Date(),
        completedAt: task.status === "completed" ? new Date() : null,
        createdAt: new Date(),
      };
      this.tasks.set(index + 1, taskRecord);
    });

    this.currentId = 200; // Start IDs after seed data
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      role: insertUser.role || "manager",
      hotelId: insertUser.hotelId || null
    };
    this.users.set(id, user);
    return user;
  }

  async getHotel(id: number): Promise<Hotel | undefined> {
    return this.hotels.get(id);
  }

  async getHotelsByOwner(ownerId: number): Promise<Hotel[]> {
    return Array.from(this.hotels.values()).filter(hotel => hotel.ownerId === ownerId);
  }

  async createHotel(insertHotel: InsertHotel): Promise<Hotel> {
    const id = this.currentId++;
    const hotel: Hotel = { 
      ...insertHotel, 
      id, 
      createdAt: new Date(),
      totalRooms: insertHotel.totalRooms || 0
    };
    this.hotels.set(id, hotel);
    return hotel;
  }

  async getRoom(id: number): Promise<Room | undefined> {
    return this.rooms.get(id);
  }

  async getRoomsByHotel(hotelId: number): Promise<Room[]> {
    return Array.from(this.rooms.values()).filter(room => room.hotelId === hotelId);
  }

  async getRoomByNumber(hotelId: number, roomNumber: string): Promise<Room | undefined> {
    return Array.from(this.rooms.values()).find(room => 
      room.hotelId === hotelId && room.roomNumber === roomNumber
    );
  }

  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const id = this.currentId++;
    const room: Room = { 
      ...insertRoom, 
      id, 
      createdAt: new Date(),
      status: insertRoom.status || "available",
      maxGuests: insertRoom.maxGuests || 2,
      amenities: insertRoom.amenities || null
    };
    this.rooms.set(id, room);
    return room;
  }

  async updateRoomStatus(roomId: number, status: string): Promise<Room | undefined> {
    const room = this.rooms.get(roomId);
    if (room) {
      room.status = status;
      this.rooms.set(roomId, room);
      return room;
    }
    return undefined;
  }

  async getGuest(id: number): Promise<Guest | undefined> {
    return this.guests.get(id);
  }

  async getGuestByEmail(email: string): Promise<Guest | undefined> {
    return Array.from(this.guests.values()).find(guest => guest.email === email);
  }

  async createGuest(insertGuest: InsertGuest): Promise<Guest> {
    const id = this.currentId++;
    const guest: Guest = { 
      ...insertGuest, 
      id, 
      createdAt: new Date(),
      address: insertGuest.address || null,
      idType: insertGuest.idType || null,
      idNumber: insertGuest.idNumber || null
    };
    this.guests.set(id, guest);
    return guest;
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingsByHotel(hotelId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(booking => booking.hotelId === hotelId);
  }

  async getRecentBookings(hotelId: number, limit: number = 10): Promise<Booking[]> {
    return Array.from(this.bookings.values())
      .filter(booking => booking.hotelId === hotelId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.currentId++;
    const booking: Booking = { 
      ...insertBooking, 
      id, 
      createdAt: new Date(),
      status: insertBooking.status || "pending",
      numberOfGuests: insertBooking.numberOfGuests || 1,
      specialRequests: insertBooking.specialRequests || null,
      paymentStatus: insertBooking.paymentStatus || "pending"
    };
    this.bookings.set(id, booking);
    
    // Update room status to reserved
    await this.updateRoomStatus(insertBooking.roomId, "reserved");
    
    return booking;
  }

  async updateBookingStatus(bookingId: number, status: string): Promise<Booking | undefined> {
    const booking = this.bookings.get(bookingId);
    if (booking) {
      booking.status = status;
      this.bookings.set(bookingId, booking);
      
      // Update room status based on booking status
      if (status === "checked_in") {
        await this.updateRoomStatus(booking.roomId, "occupied");
      } else if (status === "checked_out" || status === "cancelled") {
        await this.updateRoomStatus(booking.roomId, "available");
      }
      
      return booking;
    }
    return undefined;
  }

  async getStaff(id: number): Promise<Staff | undefined> {
    return this.staff.get(id);
  }

  async getStaffByHotel(hotelId: number): Promise<Staff[]> {
    return Array.from(this.staff.values()).filter(staff => staff.hotelId === hotelId);
  }

  async createStaff(insertStaff: InsertStaff): Promise<Staff> {
    const id = this.currentId++;
    const staff: Staff = { 
      ...insertStaff, 
      id, 
      createdAt: new Date(),
      salary: insertStaff.salary || null,
      isActive: insertStaff.isActive !== undefined ? insertStaff.isActive : true
    };
    this.staff.set(id, staff);
    return staff;
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getTasksByHotel(hotelId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.hotelId === hotelId);
  }

  async getTodayTasks(hotelId: number): Promise<Task[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return Array.from(this.tasks.values()).filter(task => 
      task.hotelId === hotelId &&
      (task.dueDate ? task.dueDate >= today && task.dueDate < tomorrow : true)
    );
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentId++;
    const task: Task = { 
      ...insertTask, 
      id, 
      createdAt: new Date(),
      description: insertTask.description || null,
      status: insertTask.status || "pending",
      assignedTo: insertTask.assignedTo || null,
      priority: insertTask.priority || "medium",
      dueDate: insertTask.dueDate || null,
      completedAt: null
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTaskStatus(taskId: number, status: string, completedAt?: Date): Promise<Task | undefined> {
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = status;
      if (status === "completed" && !task.completedAt) {
        task.completedAt = completedAt || new Date();
      }
      this.tasks.set(taskId, task);
      return task;
    }
    return undefined;
  }

  async getDashboardStats(hotelId: number): Promise<{
    totalBookings: number;
    occupancyRate: number;
    revenue: number;
    availableRooms: number;
    totalRooms: number;
    occupiedRooms: number;
    maintenanceRooms: number;
    reservedRooms: number;
  }> {
    const rooms = await this.getRoomsByHotel(hotelId);
    const bookings = await this.getBookingsByHotel(hotelId);
    
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter(room => room.status === "occupied").length;
    const availableRooms = rooms.filter(room => room.status === "available").length;
    const maintenanceRooms = rooms.filter(room => room.status === "maintenance").length;
    const reservedRooms = rooms.filter(room => room.status === "reserved").length;
    
    const occupancyRate = Math.round((occupiedRooms / totalRooms) * 100);
    
    const revenue = bookings
      .filter(booking => booking.paymentStatus === "paid")
      .reduce((sum, booking) => sum + parseFloat(booking.totalAmount), 0);

    return {
      totalBookings: bookings.length,
      occupancyRate,
      revenue,
      availableRooms,
      totalRooms,
      occupiedRooms,
      maintenanceRooms,
      reservedRooms,
    };
  }
}

// Database Storage implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        role: insertUser.role || "manager",
        hotelId: insertUser.hotelId || null
      })
      .returning();
    return user;
  }

  async getHotel(id: number): Promise<Hotel | undefined> {
    const [hotel] = await db.select().from(hotels).where(eq(hotels.id, id));
    return hotel || undefined;
  }

  async getHotelsByOwner(ownerId: number): Promise<Hotel[]> {
    return db.select().from(hotels).where(eq(hotels.ownerId, ownerId));
  }

  async createHotel(insertHotel: InsertHotel): Promise<Hotel> {
    const [hotel] = await db
      .insert(hotels)
      .values({
        ...insertHotel,
        totalRooms: insertHotel.totalRooms || 0
      })
      .returning();
    return hotel;
  }

  async getRoom(id: number): Promise<Room | undefined> {
    const [room] = await db.select().from(rooms).where(eq(rooms.id, id));
    return room || undefined;
  }

  async getRoomsByHotel(hotelId: number): Promise<Room[]> {
    return db.select().from(rooms).where(eq(rooms.hotelId, hotelId));
  }

  async getRoomByNumber(hotelId: number, roomNumber: string): Promise<Room | undefined> {
    const [room] = await db
      .select()
      .from(rooms)
      .where(and(eq(rooms.hotelId, hotelId), eq(rooms.roomNumber, roomNumber)));
    return room || undefined;
  }

  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const [room] = await db
      .insert(rooms)
      .values({
        ...insertRoom,
        status: insertRoom.status || "available",
        maxGuests: insertRoom.maxGuests || 2,
        amenities: insertRoom.amenities || null
      })
      .returning();
    return room;
  }

  async updateRoomStatus(roomId: number, status: string): Promise<Room | undefined> {
    const [room] = await db
      .update(rooms)
      .set({ status })
      .where(eq(rooms.id, roomId))
      .returning();
    return room || undefined;
  }

  async getGuest(id: number): Promise<Guest | undefined> {
    const [guest] = await db.select().from(guests).where(eq(guests.id, id));
    return guest || undefined;
  }

  async getGuestByEmail(email: string): Promise<Guest | undefined> {
    const [guest] = await db.select().from(guests).where(eq(guests.email, email));
    return guest || undefined;
  }

  async createGuest(insertGuest: InsertGuest): Promise<Guest> {
    const [guest] = await db
      .insert(guests)
      .values({
        ...insertGuest,
        address: insertGuest.address || null,
        idType: insertGuest.idType || null,
        idNumber: insertGuest.idNumber || null
      })
      .returning();
    return guest;
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking || undefined;
  }

  async getBookingsByHotel(hotelId: number): Promise<Booking[]> {
    return db.select().from(bookings).where(eq(bookings.hotelId, hotelId));
  }

  async getRecentBookings(hotelId: number, limit: number = 10): Promise<Booking[]> {
    return db
      .select()
      .from(bookings)
      .where(eq(bookings.hotelId, hotelId))
      .orderBy(desc(bookings.createdAt))
      .limit(limit);
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [booking] = await db
      .insert(bookings)
      .values({
        ...insertBooking,
        status: insertBooking.status || "pending",
        numberOfGuests: insertBooking.numberOfGuests || 1,
        specialRequests: insertBooking.specialRequests || null,
        paymentStatus: insertBooking.paymentStatus || "pending"
      })
      .returning();
    
    // Update room status to reserved
    await this.updateRoomStatus(insertBooking.roomId, "reserved");
    
    return booking;
  }

  async updateBookingStatus(bookingId: number, status: string): Promise<Booking | undefined> {
    const [booking] = await db
      .update(bookings)
      .set({ status })
      .where(eq(bookings.id, bookingId))
      .returning();
    return booking || undefined;
  }

  async getStaff(id: number): Promise<Staff | undefined> {
    const [staffMember] = await db.select().from(staff).where(eq(staff.id, id));
    return staffMember || undefined;
  }

  async getStaffByHotel(hotelId: number): Promise<Staff[]> {
    return db.select().from(staff).where(eq(staff.hotelId, hotelId));
  }

  async createStaff(insertStaff: InsertStaff): Promise<Staff> {
    const [staffMember] = await db
      .insert(staff)
      .values({
        ...insertStaff,
        salary: insertStaff.salary || null,
        isActive: insertStaff.isActive !== undefined ? insertStaff.isActive : true
      })
      .returning();
    return staffMember;
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async getTasksByHotel(hotelId: number): Promise<Task[]> {
    return db.select().from(tasks).where(eq(tasks.hotelId, hotelId));
  }

  async getTodayTasks(hotelId: number): Promise<Task[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.hotelId, hotelId),
          gte(tasks.dueDate, today),
          lt(tasks.dueDate, tomorrow)
        )
      );
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values({
        ...insertTask,
        description: insertTask.description || null,
        status: insertTask.status || "pending",
        assignedTo: insertTask.assignedTo || null,
        priority: insertTask.priority || "medium",
        dueDate: insertTask.dueDate || null,
        completedAt: null
      })
      .returning();
    return task;
  }

  async updateTaskStatus(taskId: number, status: string, completedAt?: Date): Promise<Task | undefined> {
    const updateData: any = { status };
    if (completedAt) {
      updateData.completedAt = completedAt;
    }

    const [task] = await db
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, taskId))
      .returning();
    return task || undefined;
  }

  async getDashboardStats(hotelId: number): Promise<{
    totalBookings: number;
    occupancyRate: number;
    revenue: number;
    availableRooms: number;
    totalRooms: number;
    occupiedRooms: number;
    maintenanceRooms: number;
    reservedRooms: number;
  }> {
    // Get total rooms
    const hotelRooms = await this.getRoomsByHotel(hotelId);
    const totalRooms = hotelRooms.length;
    
    // Count rooms by status
    const availableRooms = hotelRooms.filter(r => r.status === "available").length;
    const occupiedRooms = hotelRooms.filter(r => r.status === "occupied").length;
    const maintenanceRooms = hotelRooms.filter(r => r.status === "maintenance").length;
    const reservedRooms = hotelRooms.filter(r => r.status === "reserved").length;
    
    // Get bookings
    const hotelBookings = await this.getBookingsByHotel(hotelId);
    const totalBookings = hotelBookings.length;
    
    // Calculate revenue (simplified)
    const revenue = hotelBookings.reduce((sum, booking) => sum + parseFloat(booking.totalAmount), 0);
    
    // Calculate occupancy rate
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    return {
      totalBookings,
      occupancyRate,
      revenue,
      availableRooms,
      totalRooms,
      occupiedRooms,
      maintenanceRooms,
      reservedRooms,
    };
  }
}

// Use DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
