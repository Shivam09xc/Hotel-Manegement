# Deployment Guide

Your Hotel Management System can be deployed to various platforms. Here are the setup instructions:

## 🌐 Platform Options

### 1. Railway (Recommended - Free Tier Available)
1. Create account at [Railway](https://railway.app)
2. Connect your GitHub repository
3. Railway will automatically detect the `railway.json` config
4. Add PostgreSQL database from Railway's marketplace
5. Set environment variables:
   - `NODE_ENV=production`
   - `DATABASE_URL` (auto-provided by Railway)

### 2. Render (Free Tier Available)
1. Create account at [Render](https://render.com)
2. Connect GitHub repository
3. Use the `render.yaml` configuration
4. Render will automatically provision PostgreSQL database
5. Your app will be live at `https://your-app-name.onrender.com`

### 3. Fly.io (Free Tier Available)
1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Login: `fly auth login`
3. Deploy: `fly deploy`
4. Add PostgreSQL: `fly postgres create`
5. Connect database: `fly postgres attach <database-name>`

### 4. Docker Deployment (Any VPS)
1. Install Docker and Docker Compose
2. Update database credentials in `docker-compose.yml`
3. Run: `docker-compose up -d`
4. Access at `http://your-server-ip:5000`

### 5. Heroku
1. Create Heroku app: `heroku create your-app-name`
2. Add PostgreSQL: `heroku addons:create heroku-postgresql:mini`
3. Deploy: `git push heroku main`
4. Run migrations: `heroku run npm run db:push`

## 🔧 Environment Variables Required

All platforms need these variables:
- `NODE_ENV=production`
- `DATABASE_URL=postgresql://username:password@host:port/database`

## 🗃️ Database Setup

Your app includes automatic database seeding with sample data:
- Grand Plaza Hotel
- 10 sample rooms
- 4 guest profiles
- 3 active bookings
- 4 staff members
- 3 daily tasks

## 🔐 Default Login Credentials

- Username: `admin`
- Password: `admin123`

**Important**: Change these credentials after deployment!

## 📱 Features Available After Deployment

- Complete hotel management dashboard
- Room booking and management system
- Staff and guest management
- Real-time statistics and analytics
- Mobile-responsive design
- PostgreSQL database with persistent data
- Secure authentication system

Choose the platform that best fits your needs. Railway and Render offer the easiest deployment experience with free tiers perfect for testing and small-scale usage.