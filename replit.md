# Hotel Management System

## Overview

This is a modern hotel management SaaS application built with a full-stack TypeScript architecture. The system provides comprehensive hotel operations management including room bookings, guest management, staff coordination, and analytics through a clean, responsive web interface.

## User Preferences

```
Preferred communication style: Simple, everyday language.
```

## System Architecture

The application follows a client-server architecture with the following key components:

### Frontend Architecture
- **React 18** with TypeScript for the client application
- **Vite** as the build tool and development server
- **Tailwind CSS** with shadcn/ui component library for styling
- **React Query** for server state management and caching
- **Wouter** for lightweight client-side routing
- **React Hook Form** with Zod validation for form handling

### Backend Architecture
- **Express.js** server with TypeScript
- **RESTful API** design with organized route handlers
- **In-memory storage** implementation (can be extended to database)
- **Modular route structure** for scalability

### Database Layer
- **PostgreSQL** database with Drizzle ORM integration
- **Schema-first approach** with shared TypeScript types
- **Migration support** through drizzle-kit
- **DatabaseStorage** replaces in-memory storage for persistent data
- **Automatic seeding** with sample hotel data on startup

## Key Components

### Data Models
The system defines comprehensive schemas for:
- **Users** - Authentication and role-based access (manager, admin, staff)
- **Hotels** - Multi-tenant hotel properties
- **Rooms** - Room types, status tracking, and pricing
- **Guests** - Customer information and contact details
- **Bookings** - Reservation management with status tracking
- **Staff** - Employee management and role assignments
- **Tasks** - Daily operations and maintenance tracking

### Authentication & Authorization
- Role-based access control (manager, admin, staff)
- JWT token-based authentication
- Protected API endpoints
- User session management

### Core Features
- **Dashboard Analytics** - Real-time hotel statistics and KPIs
- **Booking Management** - Room reservations and status tracking
- **Room Status Monitoring** - Real-time availability and maintenance
- **Task Management** - Daily operations and staff assignments
- **Guest Management** - Customer profiles and history

## Data Flow

1. **Client Requests** - React components make API calls using React Query
2. **API Layer** - Express routes handle requests and validate data
3. **Business Logic** - Route handlers process operations through storage layer
4. **Data Persistence** - Storage interface abstracts database operations
5. **Response** - JSON data returned to client with proper error handling

The application uses a shared schema definition between client and server, ensuring type safety across the entire stack.

## External Dependencies

### UI Components
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **Tailwind CSS** - Utility-first styling

### Development Tools
- **TypeScript** - Type safety across the stack
- **ESBuild** - Fast bundling for production
- **PostCSS** - CSS processing

### Database & ORM
- **Drizzle ORM** - Type-safe database operations
- **Neon Database** - Serverless PostgreSQL hosting
- **Zod** - Runtime type validation

## Deployment Strategy

The application is configured for modern deployment platforms:

### Development
- **Vite dev server** with HMR and error overlay
- **TSX** for running TypeScript server directly
- **Concurrent development** of client and server

### Production Build
- **Vite build** for optimized client bundle
- **ESBuild** for server compilation
- **Static file serving** from Express server

### Environment Configuration
- **DATABASE_URL** for PostgreSQL connection
- **NODE_ENV** for environment-specific behavior
- **PostgreSQL credentials** (PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE)
- Support for **Replit** deployment with special handling

## Recent Changes
- **January 19, 2025**: Added PostgreSQL database integration
  - Created database configuration in `server/db.ts`
  - Implemented `DatabaseStorage` class replacing in-memory storage
  - Added automatic database seeding with sample data
  - Migrated all storage operations to use persistent database
  - Sample data includes: Grand Plaza Hotel, 10 rooms, 4 guests, 3 bookings, 4 staff members, 3 tasks
  - Fixed all navigation issues (sidebar, mobile menu, search, notifications)
  - Resolved React DOM nesting warnings
  - Added deployment configurations for multiple platforms

## Deployment Options

The application is now configured for deployment to multiple platforms:

### Supported Platforms
- **Railway** - Recommended free tier with automatic PostgreSQL
- **Render** - Free tier with integrated database
- **Fly.io** - Modern platform with global deployment
- **Docker** - Self-hosted deployment on any VPS
- **Heroku** - Traditional PaaS platform

### Deployment Files Created
- `Dockerfile` - Container configuration
- `docker-compose.yml` - Local Docker development
- `railway.json` - Railway platform configuration
- `render.yaml` - Render platform configuration  
- `fly.toml` - Fly.io deployment settings
- `netlify.toml` - Netlify configuration
- `DEPLOYMENT.md` - Complete deployment guide

### Default Credentials
- Username: `admin`
- Password: `admin123`

The architecture supports horizontal scaling and can be deployed to various platforms with automatic database provisioning and environment management.