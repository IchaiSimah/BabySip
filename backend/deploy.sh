#!/bin/bash

# BabySip Backend Deployment Script
# Usage: ./deploy.sh

set -e  # Exit on error

echo "🚀 Starting BabySip Backend Deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "📝 Please copy env.example to .env and configure it:"
    echo "   cp env.example .env"
    echo "   nano .env"
    exit 1
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Pull latest code (if using git)
# echo "📥 Pulling latest code..."
# git pull

# Build Docker images
echo "🔨 Building Docker images..."
docker-compose build --no-cache

# Start containers
echo "▶️  Starting containers..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to start..."
sleep 10

# Check container status
echo "📊 Container status:"
docker-compose ps

# Check logs
echo "📋 Recent logs:"
docker-compose logs --tail=50

# Test health endpoint
echo "🏥 Testing health endpoint..."
sleep 5
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Health check passed!"
else
    echo "❌ Health check failed! Check logs: docker-compose logs"
    exit 1
fi

echo "✅ Deployment complete!"
echo "📡 API available at: http://localhost:3000"
echo "🔍 View logs: docker-compose logs -f"
echo "🛑 Stop services: docker-compose down"

