#!/bin/bash
# Start All Development Servers
# Starts both frontend (Vite) and backend (Express) servers

set -e

cd "$(dirname "$0")"

echo "🚀 Starting Riya AI Development Environment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to kill process on a port
kill_port() {
  local port=$1
  local pids=$(lsof -ti:$port 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo -e "${YELLOW}⚠️  Port $port is in use. Killing existing process(es)...${NC}"
    echo "$pids" | xargs kill -9 2>/dev/null || true
    sleep 1
  fi
}

# Kill processes on ports 8080 (frontend) and 3000 (backend)
echo "🧹 Cleaning up ports..."
kill_port 8080
kill_port 3000
echo -e "${GREEN}✅ Ports cleared${NC}"
echo ""

# Create a cleanup function
cleanup() {
  echo ""
  echo -e "${YELLOW}🛑 Shutting down servers...${NC}"
  kill_port 8080
  kill_port 3000
  # Kill any node processes we started
  pkill -f "vite" 2>/dev/null || true
  pkill -f "tsx server/index.ts" 2>/dev/null || true
  echo -e "${GREEN}✅ Servers stopped${NC}"
  exit 0
}

# Trap Ctrl+C and cleanup
trap cleanup SIGINT SIGTERM

# Set environment variables
export NODE_ENV=development
export PORT=3000

# Start backend server in background
echo -e "${GREEN}📦 Starting backend server on port 3000...${NC}"
npm run dev:server > /tmp/riya-backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"
echo "   Logs: tail -f /tmp/riya-backend.log"
sleep 2

# Check if backend started successfully
if ! kill -0 $BACKEND_PID 2>/dev/null; then
  echo -e "${RED}❌ Backend server failed to start${NC}"
  echo "   Check logs: cat /tmp/riya-backend.log"
  exit 1
fi

# Start frontend server in background
echo -e "${GREEN}🎨 Starting frontend server on port 8080...${NC}"
npm run dev > /tmp/riya-frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"
echo "   Logs: tail -f /tmp/riya-frontend.log"
sleep 3

# Check if frontend started successfully
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
  echo -e "${RED}❌ Frontend server failed to start${NC}"
  echo "   Check logs: cat /tmp/riya-frontend.log"
  cleanup
  exit 1
fi

echo ""
echo -e "${GREEN}✅ All servers started successfully!${NC}"
echo ""
echo "📍 Frontend: http://localhost:8080"
echo "📍 Backend:  http://localhost:3000"
echo ""
echo "📋 View logs:"
echo "   Backend:  tail -f /tmp/riya-backend.log"
echo "   Frontend: tail -f /tmp/riya-frontend.log"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID

