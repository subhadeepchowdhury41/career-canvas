import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/auth.utils";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * Authentication middleware to verify JWT access token
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        message: "Authentication required. Please provide a valid token." 
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify token
    const payload = verifyAccessToken(token);

    // Attach user info to request
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({ 
      message: "Invalid or expired token. Please log in again." 
    });
  }
}

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export function optionalAuthenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const payload = verifyAccessToken(token);
      
      req.user = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      };
    }
  } catch (error) {
    // Silently fail for optional auth
  }
  
  next();
}
