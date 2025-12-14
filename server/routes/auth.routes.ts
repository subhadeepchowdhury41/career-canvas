import { Router, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, companies, refreshTokens, type SafeUser, loginSchema, insertUserSchema } from "@shared/schema";
import { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyRefreshToken,
  hashPassword,
  comparePassword,
  getRefreshTokenExpiry
} from "../utils/auth.utils";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post("/register", async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = insertUserSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, validatedData.email),
    });

    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Check if username is taken
    const existingUsername = await db.query.users.findFirst({
      where: eq(users.username, validatedData.username),
    });

    if (existingUsername) {
      return res.status(400).json({ message: "Username is already taken" });
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user
    const [newUser] = await db.insert(users).values({
      ...validatedData,
      password: hashedPassword,
    }).returning();

    // Remove password from response
    const { password, ...safeUser } = newUser;

    // Generate tokens
    const accessToken = generateAccessToken(safeUser as SafeUser);
    const refreshToken = generateRefreshToken(safeUser as SafeUser);

    // Store refresh token in database
    await db.insert(refreshTokens).values({
      userId: newUser.id,
      token: refreshToken,
      expiresAt: getRefreshTokenExpiry(),
    });

    // Set refresh token as httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      message: "User registered successfully",
      user: safeUser,
      accessToken,
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(400).json({ message: error.message || "Registration failed" });
  }
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post("/login", async (req: Request, res: Response) => {
  try {
    // Validate request body
    const { email, password } = loginSchema.parse(req.body);

    // Find user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Remove password from user object
    const { password: _, ...safeUser } = user;

    // Fetch company slug if user is a recruiter
    let companySlug = undefined;
    if (user.companyId) {
      const company = await db.query.companies.findFirst({
        where: eq(companies.id, user.companyId),
      });
      if (company) {
        companySlug = company.slug;
      }
    }

    const userWithSlug = { ...safeUser, companySlug };

    // Generate tokens
    const accessToken = generateAccessToken(userWithSlug as SafeUser); // access token payload might need update if we want slug there too, but typically response body is used for UI
    const refreshToken = generateRefreshToken(userWithSlug as SafeUser);

    // Store refresh token in database
    await db.insert(refreshTokens).values({
      userId: user.id,
      token: refreshToken,
      expiresAt: getRefreshTokenExpiry(),
    });

    // Set refresh token as httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: "Login successful",
      user: userWithSlug,
      accessToken,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(400).json({ message: error.message || "Login failed" });
  }
});

/**
 * POST /api/auth/refresh
 * Get new access token using refresh token
 */
router.post("/refresh", async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token not found" });
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    // Check if refresh token exists in database
    const storedToken = await db.query.refreshTokens.findFirst({
      where: eq(refreshTokens.token, refreshToken),
    });

    if (!storedToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // Check if token is expired
    if (new Date() > storedToken.expiresAt) {
      // Delete expired token
      await db.delete(refreshTokens).where(eq(refreshTokens.token, refreshToken));
      return res.status(401).json({ message: "Refresh token expired" });
    }

    // Get user
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const { password, ...safeUser } = user;

    // Fetch company slug if user is a recruiter
    let companySlug = undefined;
    if (user.companyId) {
      const company = await db.query.companies.findFirst({
        where: eq(companies.id, user.companyId),
      });
      if (company) {
        companySlug = company.slug;
      }
    }

    const userWithSlug = { ...safeUser, companySlug };

    // Generate new access token
    const accessToken = generateAccessToken(userWithSlug as SafeUser);

    res.json({
      accessToken,
      user: userWithSlug,
    });
  } catch (error: any) {
    console.error("Token refresh error:", error);
    res.status(401).json({ message: "Token refresh failed" });
  }
});

/**
 * POST /api/auth/logout
 * Logout and invalidate refresh token
 */
router.post("/logout", authenticate, async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      // Delete refresh token from database
      await db.delete(refreshTokens).where(eq(refreshTokens.token, refreshToken));
    }

    // Clear refresh token cookie
    res.clearCookie("refreshToken");

    res.json({ message: "Logout successful" });
  } catch (error: any) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Logout failed" });
  }
});

/**
 * GET /api/auth/me
 * Get current user information
 */
router.get("/me", authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Get full user data from database
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.user.userId),
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, ...safeUser } = user;

    // Fetch company slug if user is a recruiter
    let companySlug = undefined;
    if (user.companyId) {
      const company = await db.query.companies.findFirst({
        where: eq(companies.id, user.companyId),
      });
      if (company) {
        companySlug = company.slug;
      }
    }

    const userWithSlug = { ...safeUser, companySlug };

    res.json({ user: userWithSlug });
  } catch (error: any) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Failed to get user information" });
  }
});

export default router;
