import { db } from "./db";
import { users, hotels, rooms, guests, bookings, staff, tasks } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function seedDatabase() {
  try {
    console.log("🌱 Seeding database...");

    // Create admin user
    const [adminUser] = await db
      .insert(users)
      .values({
        username: "admin",
        email: "admin@grandplaza.com",
        password: "admin123", // Note: In production, this should be hashed
        role: "admin",
        hotelId: null
      })
      .returning()
      .catch(() => []); // Ignore if exists

    // Create hotel
    const [hotel] = await db
      .insert(hotels)
      .values({
        name: "Grand Plaza Hotel",
        address: "123 Downtown Avenue, City Center",
        phone: "+1-555-0123",
        email: "info@grandplaza.com",
        description: "A luxury hotel in the heart of the city",
        totalRooms: 180,
        ownerId: adminUser?.id || 1
      })
      .returning()
      .catch(() => []); // Ignore if exists

    const hotelId = hotel?.id || 1;

    // Update admin user with hotel ID
    if (adminUser) {
      await db
        .update(users)
        .set({ hotelId })
        .where(eq(users.id, adminUser.id));
    }

    // Create sample rooms
    const roomData = [
      { roomNumber: "101", type: "standard", pricePerNight: "120.00", status: "available", floor: 1, maxGuests: 2 },
      { roomNumber: "102", type: "standard", pricePerNight: "120.00", status: "occupied", floor: 1, maxGuests: 2 },
      { roomNumber: "103", type: "deluxe", pricePerNight: "180.00", status: "available", floor: 1, maxGuests: 3 },
      { roomNumber: "104", type: "deluxe", pricePerNight: "180.00", status: "reserved", floor: 1, maxGuests: 3 },
      { roomNumber: "105", type: "suite", pricePerNight: "350.00", status: "maintenance", floor: 1, maxGuests: 4 },
      { roomNumber: "201", type: "standard", pricePerNight: "125.00", status: "available", floor: 2, maxGuests: 2 },
      { roomNumber: "202", type: "standard", pricePerNight: "125.00", status: "occupied", floor: 2, maxGuests: 2 },
      { roomNumber: "203", type: "deluxe", pricePerNight: "185.00", status: "available", floor: 2, maxGuests: 3 },
      { roomNumber: "204", type: "deluxe", pricePerNight: "185.00", status: "occupied", floor: 2, maxGuests: 3 },
      { roomNumber: "205", type: "suite", pricePerNight: "360.00", status: "available", floor: 2, maxGuests: 4 }
    ];

    for (const room of roomData) {
      await db
        .insert(rooms)
        .values({
          hotelId,
          ...room,
          amenities: room.type === "suite" ? ["WiFi", "TV", "Mini Bar", "Balcony", "Kitchen"] : 
                   room.type === "deluxe" ? ["WiFi", "TV", "Mini Bar", "Balcony"] : 
                   ["WiFi", "TV"]
        })
        .catch(() => {}); // Ignore if exists
    }

    // Create sample guests
    const guestData = [
      { firstName: "John", lastName: "Smith", email: "john.smith@email.com", phone: "+1-555-0101" },
      { firstName: "Sarah", lastName: "Johnson", email: "sarah.johnson@email.com", phone: "+1-555-0102" },
      { firstName: "Mike", lastName: "Wilson", email: "mike.wilson@email.com", phone: "+1-555-0103" },
      { firstName: "Emily", lastName: "Brown", email: "emily.brown@email.com", phone: "+1-555-0104" }
    ];

    for (const guest of guestData) {
      await db
        .insert(guests)
        .values(guest)
        .catch(() => {}); // Ignore if exists
    }

    // Create sample bookings
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const bookingData = [
      {
        hotelId,
        roomId: 104, // Deluxe room that's reserved
        guestId: 1,
        checkInDate: today,
        checkOutDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days
        numberOfGuests: 2,
        totalAmount: "540.00", // 3 nights * $180
        status: "confirmed",
        paymentStatus: "paid"
      },
      {
        hotelId,
        roomId: 102, // Standard room that's occupied
        guestId: 2,
        checkInDate: new Date(today.getTime() - 24 * 60 * 60 * 1000), // Yesterday
        checkOutDate: tomorrow,
        numberOfGuests: 1,
        totalAmount: "240.00", // 2 nights * $120
        status: "confirmed",
        paymentStatus: "paid"
      },
      {
        hotelId,
        roomId: 202, // Standard room that's occupied
        guestId: 3,
        checkInDate: today,
        checkOutDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days
        numberOfGuests: 2,
        totalAmount: "250.00", // 2 nights * $125
        status: "confirmed",
        paymentStatus: "pending"
      }
    ];

    for (const booking of bookingData) {
      await db
        .insert(bookings)
        .values(booking)
        .catch(() => {}); // Ignore if exists
    }

    // Create sample staff
    const staffData = [
      { hotelId, firstName: "Alice", lastName: "Manager", email: "alice@grandplaza.com", phone: "+1-555-0201", role: "manager", department: "management", salary: "65000.00" },
      { hotelId, firstName: "Bob", lastName: "Receptionist", email: "bob@grandplaza.com", phone: "+1-555-0202", role: "receptionist", department: "front desk", salary: "35000.00" },
      { hotelId, firstName: "Carol", lastName: "Housekeeper", email: "carol@grandplaza.com", phone: "+1-555-0203", role: "housekeeper", department: "housekeeping", salary: "30000.00" },
      { hotelId, firstName: "David", lastName: "Maintenance", email: "david@grandplaza.com", phone: "+1-555-0204", role: "maintenance", department: "maintenance", salary: "40000.00" }
    ];

    for (const staffMember of staffData) {
      await db
        .insert(staff)
        .values(staffMember)
        .catch(() => {}); // Ignore if exists
    }

    // Create sample tasks
    const taskData = [
      {
        hotelId,
        title: "Room 205 cleaning",
        description: "Deep clean and restock room 205",
        status: "pending",
        priority: "high",
        assignedTo: 3, // Carol Housekeeper
        dueDate: today
      },
      {
        hotelId,
        title: "Fix AC in room 301",
        description: "Air conditioning unit not working properly",
        status: "in_progress",
        priority: "medium",
        assignedTo: 4, // David Maintenance
        dueDate: today
      },
      {
        hotelId,
        title: "Inventory check",
        description: "Weekly inventory check for housekeeping supplies",
        status: "pending",
        priority: "low",
        assignedTo: 1, // Alice Manager
        dueDate: tomorrow
      }
    ];

    for (const task of taskData) {
      await db
        .insert(tasks)
        .values(task)
        .catch(() => {}); // Ignore if exists
    }

    console.log("✅ Database seeded successfully!");
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}