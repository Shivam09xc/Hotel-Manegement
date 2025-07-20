# Hotel Management System

A complete hotel management SaaS application built with Express.js, React, and PostgreSQL. Features a modern dashboard for managing hotel operations including bookings, rooms, staff, and guests.

## Features

- **Dashboard Analytics** - Real-time hotel statistics and KPIs
- **Booking Management** - Room reservations and status tracking  
- **Room Management** - Real-time availability and maintenance
- **Staff Management** - Employee coordination and role assignments
- **Guest Profiles** - Customer information and history
- **Task Management** - Daily operations tracking
- **Mobile Responsive** - Works perfectly on all devices
- **Authentication** - Secure login with role-based access

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, Node.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: React Query
- **Routing**: Wouter
- **Form Handling**: React Hook Form with Zod validation

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd hotel-management-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Initialize database:
```bash
npm run db:push
```

5. Start development server:
```bash
npm run dev
```

Visit http://localhost:5000 and login with:
- Username: `admin`
- Password: `admin123`

## Deployment

The application supports deployment to multiple platforms:

- **Railway** - Recommended free tier
- **Render** - Free tier with PostgreSQL
- **Fly.io** - Global deployment
- **Docker** - Self-hosted option
- **Heroku** - Traditional PaaS

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Sample Data

The application includes automatic database seeding with:
- Grand Plaza Hotel configuration
- 10 sample hotel rooms
- 4 guest profiles  
- 3 active bookings
- 4 staff members
- 3 daily tasks

## Project Structure

```
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Application pages
│   │   └── hooks/       # Custom React hooks
├── server/              # Express.js backend
│   ├── routes.ts        # API routes
│   ├── storage.ts       # Database operations
│   └── db.ts           # Database configuration
├── shared/              # Shared TypeScript schemas
└── deployment configs   # Platform-specific configs
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.