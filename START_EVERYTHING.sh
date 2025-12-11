#!/bin/bash
# Start both backend and frontend servers

cd "$(dirname "$0")"

echo "═══════════════════════════════════════════════════════════"
echo "  🚀 Starting Riya AI Development Servers"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Check if backend is running
if lsof -ti:3000 > /dev/null 2>&1; then
  echo "✅ Backend server already running on port 3000"
else
  echo "📦 Starting backend server on port 3000..."
  echo "   (This will run in the background)"
  echo ""
  
  # Start backend in background
  PORT=3000 NODE_ENV=development npx tsx server/index.ts > server.log 2>&1 &
  BACKEND_PID=$!
  
  # Wait a moment for server to start
  sleep 3
  
  # Check if it started successfully
  if lsof -ti:3000 > /dev/null 2>&1; then
    echo "✅ Backend server started (PID: $BACKEND_PID)"
    echo "   Logs: tail -f server.log"
  else
    echo "❌ Backend server failed to start"
    echo "   Check server.log for errors"
    exit 1
  fi
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  📊 Server Status"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "✅ Backend API:  http://localhost:3000"
echo "✅ Frontend:     http://localhost:8080 (run 'npm run dev' in another terminal)"
echo ""
echo "📝 To start frontend, open a NEW terminal and run:"
echo "   cd $(pwd)"
echo "   npm run dev"
echo ""
echo "🌐 Then open: http://localhost:8080"
echo ""
echo "🛑 To stop backend: kill $BACKEND_PID (or lsof -ti:3000 | xargs kill)"
echo ""


