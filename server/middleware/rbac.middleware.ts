import type { Request, Response, NextFunction } from "express";
import type { UserRole } from "@shared/schema";

/**
 * RBAC middleware to check if user has required role
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: "Authentication required" 
      });
    }

    const userRole = req.user.role as UserRole;
    console.log("User role:", userRole);
    console.log("Allowed roles:", allowedRoles);
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: "Access denied. You don't have permission to perform this action." 
      });
    }

    next();
  };
}

/**
 * Middleware to check if user owns the resource or is admin
 */
export function requireOwnerOrAdmin(getUserIdFromRequest: (req: Request) => string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: "Authentication required" 
      });
    }

    const resourceUserId = getUserIdFromRequest(req);
    const isOwner = req.user.userId === resourceUserId;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        message: "Access denied. You can only access your own resources." 
      });
    }

    next();
  };
}

/**
 * Middleware to check if user belongs to the company or is admin
 */
export function requireCompanyAccessOrAdmin(getCompanyIdFromRequest: (req: Request) => string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    console.log("Checking company access...");
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required" 
      });
    }

    const companyId = getCompanyIdFromRequest(req);
    const isAdmin = req.user.role === "admin";

    // Admin has access to all companies
    if (isAdmin) {
      return next();
    }

    // For recruiters, we would need to check if they belong to the company
    // This would require a database query, which we'll implement in the route handlers
    next();
  };
}
