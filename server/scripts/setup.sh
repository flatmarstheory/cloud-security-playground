#!/bin/bash

# Cloud Security Playground Setup Script

echo "🔐 Setting up Cloud Security Playground..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd client
npm install
cd ..

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "🔧 Creating .env file..."
    cat > .env << EOF
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security Headers
HELMET_CONTENT_SECURITY_POLICY=true

# Logging
LOG_LEVEL=info
EOF
    echo "✅ Created .env file"
fi

# Create logs directory
mkdir -p logs

echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "1. Start the backend: npm run dev"
echo "2. Start the frontend: cd client && npm start"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "For Docker deployment:"
echo "docker-compose up --build" 