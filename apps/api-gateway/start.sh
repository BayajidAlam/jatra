#!/bin/bash

# Jatra API Gateway - Quick Start Script

echo "🚀 Starting Jatra API Gateway..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update .env with your configuration"
fi

# Build and run
echo "🔨 Building API Gateway..."
go build -o api-gateway .

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "🌐 Starting API Gateway on port 3000..."
    ./api-gateway
else
    echo "❌ Build failed!"
    exit 1
fi
