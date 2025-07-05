#!/bin/bash

# ChadEmpire Deployment Script
echo "🚀 Starting ChadEmpire deployment process..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "⚠️  Warning: .env.local file not found. Creating from example..."
  if [ -f .env.local.example ]; then
    cp .env.local.example .env.local
    echo "✅ Created .env.local from example. Please update with your actual values."
  else
    echo "❌ Error: .env.local.example not found. Please create .env.local manually."
    exit 1
  fi
fi

# Run linting
echo "🔍 Running linting checks..."
npm run lint

# Run tests
echo "🧪 Running tests..."
npm test

# Build the application
echo "🏗️  Building application..."
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
echo "Select 'y' to link to existing project if you've deployed before."
npx vercel --prod

echo "✅ Deployment process completed!"
