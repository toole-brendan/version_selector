import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use dynamic port finding with a fallback to 5000
  const findAvailablePort = async (startPort: number, maxAttempts = 10): Promise<number> => {
    const net = await import('net');
    
    return new Promise((resolve) => {
      let currentPort = startPort;
      let attempts = 0;
      
      const tryPort = () => {
        if (attempts >= maxAttempts) {
          log(`Could not find an available port after ${maxAttempts} attempts, using default port ${startPort}`);
          resolve(startPort);
          return;
        }
        
        const server = net.createServer();
        server.unref();
        
        server.on('error', () => {
          currentPort++;
          attempts++;
          tryPort();
        });
        
        server.listen(currentPort, () => {
          server.close(() => {
            resolve(currentPort);
          });
        });
      };
      
      tryPort();
    });
  };

  const defaultPort = parseInt(process.env.PORT || '5000', 10);
  const port = await findAvailablePort(defaultPort);
  
  server.listen(port, "localhost", () => {
    log(`🚀 Server running at http://localhost:${port}`);
  });
})();
