#!/bin/bash

# Social Story Scraper - Easy Setup Script
# This script sets up the environment and starts the application

set -e

echo "🚀 Social Story Scraper - Setup"
echo "================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first:"
    echo "   https://docs.docker.com/engine/install/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first:"
    echo "   https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker is installed"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file with secure random keys..."
    python3 -c "
import secrets
print('SECRET_KEY=' + secrets.token_urlsafe(32))
print('ENCRYPTION_KEY=' + secrets.token_urlsafe(32))
print('JWT_SECRET_KEY=' + secrets.token_urlsafe(32))
" > .env
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

echo ""

# Pull/Build containers
echo "🏗️  Building Docker containers..."
docker-compose build

echo ""
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if backend is running
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend is running!"
else
    echo "⏳ Backend is still starting... (this may take a minute on first run)"
fi

echo ""
echo "================================"
echo "✅ Setup Complete!"
echo ""
echo "🌐 API Documentation: http://localhost:8000/api/v1/docs"
echo "🏥 Health Check:      http://localhost:8000/health"
echo ""
echo "📝 Next steps:"
echo "   1. Visit http://localhost:8000/api/v1/docs"
echo "   2. Register a new account"
echo "   3. Add your API keys (Apify, OpenAI/Claude/Gemini, Perplexity, Telegram)"
echo "   4. Configure your preferences"
echo "   5. Run your first scrape!"
echo ""
echo "📊 View logs:    docker-compose logs -f backend"
echo "🛑 Stop:         docker-compose down"
echo "🔄 Restart:      docker-compose restart"
echo ""
