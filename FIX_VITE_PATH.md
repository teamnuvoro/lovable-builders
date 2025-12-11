# Fix for Vite Path Issue

The problem is that Vite root is set to `client` directory, but when it tries to resolve `/src/main.tsx`, it's not finding it.

**Solution:** The root path resolution might be incorrect. Let me check the actual path being used.

Try running with explicit debugging:
```bash
NODE_ENV=development node --loader tsx server/index.ts
```

Then check the console output to see what path Vite is using.

Alternatively, we can try setting the root differently or checking if there's a path resolution issue.
