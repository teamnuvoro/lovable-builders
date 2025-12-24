# 🚀 Quick Start Guide

## Start Everything with One Command

You have **two options** to start both frontend and backend servers:

### Option 1: Using npm script (Recommended - Cross-platform)

```bash
npm run dev:all
```

This uses `concurrently` to run both servers in one terminal window.

### Option 2: Using the shell script (Mac/Linux)

```bash
./start-all.sh
```

Or:

```bash
npm run start:all
```

This script:
- ✅ Automatically kills any processes on ports 8080 and 3000
- ✅ Starts backend server on port 3000
- ✅ Starts frontend server on port 8080
- ✅ Shows colored output and logs
- ✅ Handles cleanup on Ctrl+C

## What Gets Started

- **Frontend (Vite):** http://localhost:8080
- **Backend (Express):** http://localhost:3000

## View Logs

If using the shell script (`start-all.sh`):
```bash
# Backend logs
tail -f /tmp/riya-backend.log

# Frontend logs
tail -f /tmp/riya-frontend.log
```

## Stop Servers

- **Option 1:** Press `Ctrl+C` in the terminal
- **Option 2:** Kill ports manually:
  ```bash
  lsof -ti:8080 | xargs kill -9
  lsof -ti:3000 | xargs kill -9
  ```

## Troubleshooting

### Port already in use
The scripts automatically handle this, but if you need to manually free ports:
```bash
lsof -ti:8080 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

### Script not executable
```bash
chmod +x start-all.sh
```

