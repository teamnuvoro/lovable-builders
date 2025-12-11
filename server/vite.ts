import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    root: path.resolve(import.meta.dirname, "..", "client"),
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: {
      ...(viteConfig.server || {}),
      ...serverOptions,
    },
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    // Skip HTML parsing for non-HTML files and special paths
    if (
      url.match(/\.(ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|json|xml|txt|pdf)$/i) ||
      url.startsWith('/.well-known/') ||
      url.startsWith('/api/') ||
      url.startsWith('/_vite/')
    ) {
      return next();
    }

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      
      // Since Vite root is set to client directory, the path should be /src/main.tsx
      // Replace any old paths to the correct one and add cache buster
      if (template.includes('src="/client/src/main.tsx"')) {
        template = template.replace(
          `src="/client/src/main.tsx"`,
          `src="/src/main.tsx?v=${nanoid()}`,
        );
      } else if (template.includes('src="/src/main.tsx"')) {
        // Already correct, just add cache buster if not present
        if (!template.includes('src="/src/main.tsx?v=')) {
          template = template.replace(
            `src="/src/main.tsx"`,
            `src="/src/main.tsx?v=${nanoid()}`,
          );
        }
      }
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // Try multiple possible build paths
  const possiblePaths = [
    path.resolve(import.meta.dirname, "../dist/public"),
    path.resolve(import.meta.dirname, "public"),
    path.resolve(process.cwd(), "dist/public"),
    path.resolve(process.cwd(), "public"),
  ];

  let distPath: string | null = null;
  for (const buildPath of possiblePaths) {
    if (fs.existsSync(buildPath) && fs.existsSync(path.join(buildPath, "index.html"))) {
      distPath = buildPath;
      console.log(`[Static Files] Serving from: ${distPath}`);
      break;
    }
  }

  if (!distPath) {
    console.warn(`[Static Files] ⚠️  Build directory not found! Tried:`, possiblePaths);
    console.warn(`[Static Files] Frontend will not be served. Make sure to run 'npm run build' first.`);
    return; // Don't crash, just warn
  }

  // Serve static files with no cache
  app.use(express.static(distPath, { maxAge: 0 }));

  // Fall through to index.html for SPA routing (but skip API routes)
  app.use("*", (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith("/api")) {
      return next();
    }
    
    // Serve index.html for all other routes
    res.sendFile(path.resolve(distPath!, "index.html"), (err) => {
      if (err) {
        console.error(`[Static Files] Error serving index.html:`, err);
        next();
      }
    });
  });
}
