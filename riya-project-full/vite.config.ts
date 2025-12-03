import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { componentTagger } from "lovable-tagger";

// Use process.cwd() for Vercel compatibility
const projectRoot = process.cwd();

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    componentTagger(),
    ...(process.env.NODE_ENV !== "production" &&
      process.env.REPL_ID !== undefined
      ? [
        await import("@replit/vite-plugin-cartographer").then((m) =>
          m.cartographer(),
        ),
        await import("@replit/vite-plugin-dev-banner").then((m) =>
          m.devBanner(),
        ),
      ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.join(projectRoot, "client", "src"),
      "@shared": path.join(projectRoot, "shared"),
      "@assets": path.join(projectRoot, "attached_assets"),
    },
  },
  root: path.join(projectRoot, "client"),
  build: {
    outDir: path.join(projectRoot, "dist", "public"),
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    port: 5001,
    strictPort: true,
    fs: {
      strict: true,
      deny: [".env", ".env.*", "*.{crt,pem,key}"],
    },
  },
});
