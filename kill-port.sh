#!/bin/bash
# Quick script to kill process on any port

PORT=${1:-3000}

if [ -z "$1" ]; then
  echo "Usage: ./kill-port.sh [PORT]"
  echo "Example: ./kill-port.sh 3000"
  exit 1
fi

echo "Finding process on port $PORT..."
PID=$(lsof -ti:$PORT)

if [ -z "$PID" ]; then
  echo "✅ Port $PORT is already free!"
else
  echo "Killing process $PID on port $PORT..."
  kill -9 $PID
  sleep 1
  if lsof -ti:$PORT > /dev/null 2>&1; then
    echo "❌ Failed to kill process on port $PORT"
  else
    echo "✅ Port $PORT is now free!"
  fi
fi
