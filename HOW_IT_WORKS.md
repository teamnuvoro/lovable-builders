# How the Development Setup Works

## Two Servers Needed

Your app needs **TWO separate servers** running:

### 1. Backend Server (Express + API)
- **Port:** 3000
- **What it does:** Handles API calls, database, payments, chat
- **Start with:** `./start-dev.sh` or `npm run dev:server`
- **URL:** http://localhost:3000

### 2. Frontend Server (Vite + React)
- **Port:** 8080  
- **What it does:** Serves your React app, hot reload
- **Start with:** `npm run dev`
- **URL:** http://localhost:8080

## How They Work Together

```
Browser → http://localhost:8080 (Frontend)
           ↓
           Makes API calls to → http://localhost:3000 (Backend)
           ↓
           Backend talks to → Supabase Database
```

## Quick Start (2 Terminals)

**Terminal 1 (Backend):**
```bash
./start-dev.sh
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

**Then open:** http://localhost:8080

## What You're Seeing

When you ran `npm run dev`, you started the **frontend** server on port 8080. That's correct!

But you also need the **backend** server running on port 3000.

## Fix: Start Backend Too

Open a **NEW terminal** and run:
```bash
cd /Users/joshuavaz/Documents/project1
./start-dev.sh
```

Now you'll have:
- ✅ Backend on port 3000
- ✅ Frontend on port 8080
- ✅ Everything working!

## Or Use the Auto-Start Script

```bash
./START_EVERYTHING.sh
```

This starts the backend automatically, then you just need to run `npm run dev` for frontend.


