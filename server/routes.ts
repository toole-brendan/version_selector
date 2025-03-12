import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Since this is primarily a frontend application,
  // we don't need any specific API routes
  // The frontend routes will be handled by the client-side router

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Add redirect endpoints for defense and commercial
  app.get('/defense', (req, res) => {
    res.redirect('/public/defense/public/index.html');
  });

  app.get('/commercial', (req, res) => {
    res.redirect('/public/commercial/public/index.html');
  });

  const httpServer = createServer(app);
  return httpServer;
}
