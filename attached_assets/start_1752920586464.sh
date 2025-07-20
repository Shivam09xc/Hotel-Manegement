#!/bin/bash

# Hotel Management SaaS - Quick Start Script

echo "🏨 Hotel Management SaaS - Starting Up..."
echo "=========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp env.example .env
    echo "✅ .env file created. Please edit it with your configuration."
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if MongoDB is running (optional check)
echo "🔍 Checking MongoDB connection..."
if command -v mongod &> /dev/null; then
    if pgrep -x "mongod" > /dev/null; then
        echo "✅ MongoDB is running"
    else
        echo "⚠️  MongoDB is not running. Starting MongoDB..."
        mongod --fork --logpath /dev/null
    fi
else
    echo "⚠️  MongoDB not found locally. Make sure you have MongoDB Atlas configured in .env"
fi

# Start the application
echo "🚀 Starting Hotel Management SaaS..."
echo "=========================================="
echo "📱 Frontend: http://localhost:5000"
echo "🔧 API: http://localhost:5000/api"
echo "❤️  Health Check: http://localhost:5000/api/health"
echo "=========================================="
echo "Press Ctrl+C to stop the server"
echo ""

npm start 