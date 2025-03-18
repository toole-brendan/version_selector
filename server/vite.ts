import express, { type Express } from "express";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer, createLogger } from "vite";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { type Server } from "http";
import viteConfigFn from "../vite.config";
import react from "@vitejs/plugin-react";
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
  // Get the actual port the server is running on
  const address = server.address();
  const port = typeof address === 'object' && address !== null ? address.port : 5000;
  
  log(`Setting up Vite with server port: ${port}`);
  
  const serverOptions = {
    middlewareMode: true,
    hmr: { 
      server,
    },
    allowedHosts: true as const,
  };

  // We need to handle viteConfig differently as it's a function that returns a config object
  // No need to try to merge with viteConfig, as we'll provide all necessary settings directly

  // Get Vite config for development mode
  const viteConfigObj = typeof viteConfigFn === 'function' 
    ? viteConfigFn({ mode: 'development', command: 'serve' }) 
    : viteConfigFn;

  const vite = await createViteServer({
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "..", "client", "src"),
        "@shared": path.resolve(__dirname, "..", "shared"),
      },
    },
    base: '/',
    root: path.resolve(__dirname, "..", "client"),
    server: {
      ...serverOptions,
      proxy: {
        '/api': {
          target: `http://localhost:${port}`,
          changeOrigin: true,
        }
      }
    },
    appType: "custom",
    plugins: viteConfigObj.plugins || [react()]
  });

  // Set proper MIME types for TypeScript files
  app.use((req, res, next) => {
    if (req.path.endsWith('.tsx') || req.path.endsWith('.ts')) {
      res.type('application/javascript');
    }
    next();
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        __dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      
      // Don't append a random query param to avoid file resolution issues
      // Just use the path as is from the template
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Set proper MIME types for modern JavaScript modules
  app.use((req, res, next) => {
    if (req.path.endsWith('.js')) {
      res.type('application/javascript');
    }
    next();
  });

  app.use(express.static(distPath, {
    setHeaders: (res, path) => {
      if (path.endsWith('.js')) {
        res.set('Content-Type', 'application/javascript');
      }
    }
  }));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
