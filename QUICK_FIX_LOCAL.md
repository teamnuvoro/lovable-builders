# Quick Fix for Local Development

## Issue 1: tsx command not found

Install tsx globally or use node directly:
```bash
# Option 1: Install tsx
npm install -g tsx

# Option 2: Use node with --loader (Node 20.6+)
node --loader tsx server/index.ts

# Option 3: Use npm script (if available)
npm run dev
```

## Issue 2: Vite can't find /src/main.tsx

The Vite root is set to `client` directory, so `/src/main.tsx` should resolve to `client/src/main.tsx`.

**Current Status:**
- ✅ index.html references `/src/main.tsx`
- ✅ server/vite.ts sets root to `client` directory
- ⚠️ Need to verify the path resolution is working

**Try this:**
1. Make sure you're in the project root: `/Users/joshuavaz/Documents/project1`
2. Run: `NODE_ENV=development node --loader tsx server/index.ts`
3. Or install tsx: `npm install -g tsx` then run `NODE_ENV=development tsx server/index.ts`

