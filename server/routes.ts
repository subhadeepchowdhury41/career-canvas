import type { Express } from "express";
import { createServer, type Server } from "http";
import authRoutes from "./routes/auth.routes";
import companyRoutes from "./routes/company.routes";
import jobRoutes from "./routes/job.routes";
import brandRoutes from "./routes/brand.routes";
import contentRoutes from "./routes/content.routes";
import userRoutes from "./routes/user.routes";
import uploadRoutes from "./routes/upload.routes";

export function registerRoutes(
  httpServer: Server,
  app: Express
): Server {
  // Register all API routes with /api prefix
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  
  // Specific company sub-routes first
  app.use("/api/companies", contentRoutes);
  app.use("/api", jobRoutes); // Jobs now handles /jobs and /companies/:slug/jobs
  app.use("/api/companies", brandRoutes);
  
  // Generic company routes last
  app.use("/api/companies", companyRoutes);

  // File upload route
  app.use("/api/upload", uploadRoutes);

  return httpServer;
}
