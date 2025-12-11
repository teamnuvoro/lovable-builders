#!/bin/bash
# Development server startup script
# Automatically uses port 3000 to avoid macOS Control Center conflict

cd "$(dirname "$0")"

# Set port to 3000 if not already set
export PORT=${PORT:-3000}
export NODE_ENV=development

# Check if port is in use and kill existing process
if lsof -ti:$PORT > /dev/null 2>&1; then
  echo "⚠️  Port $PORT is already in use. Killing existing process..."
  lsof -ti:$PORT | xargs kill -9 2>/dev/null
  sleep 1
fi

echo "🚀 Starting development server on port $PORT..."
echo "📝 Note: Using port $PORT to avoid macOS Control Center conflict on port 5000"
echo ""

# Start the server using npx to find tsx in node_modules
npx tsx server/index.ts

