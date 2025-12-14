import { Router } from "express";
import { db } from "../db";
import { users, insertUserSchema, updateUserSchema, userRoles } from "@shared/user.model";
import { eq, desc } from "drizzle-orm";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware";
import { hashPassword } from "../utils/auth.utils";
import { z } from "zod";

const router = Router();

// Middleware to ensure administration rights
router.use(authenticate, requireRole("admin"));

// List all users
router.get("/", async (req, res) => {
  try {
    const allUsers = await db.query.users.findMany({
      orderBy: [desc(users.createdAt)],
      with: {
        // user.model.ts doesn't seem to have relations defined yet, so we just return flat user
        // later we can add company relation
      }
    });
    
    // Remove passwords from response
    const safeUsers = allUsers.map(({ password, ...rest }) => rest);
    res.json({ users: safeUsers });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// Create a new user
router.post("/", async (req, res) => {
  try {
    const data = insertUserSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, data.email),
    });

    if (existingUser) {
      return res.status(409).json({ message: "User with this email already exists" });
    }

    const hashedPassword = await hashPassword(data.password);
    
    const [newUser] = await db.insert(users).values({
      ...data,
      password: hashedPassword,
    }).returning();

    const { password: _, ...safeUser } = newUser;
    res.status(201).json({ user: safeUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Failed to create user" });
  }
});

// Update a user
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = updateUserSchema.parse(req.body);
    // Note: Password update not supported here, dedicated endpoint preferred or separate logic
    // updateUserSchema omits password

    const [updatedUser] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password: _, ...safeUser } = updatedUser;
    res.json({ user: safeUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
});

// Delete a user
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting self? Maybe.
    if (req.user?.id === id) {
       return res.status(400).json({ message: "Cannot delete yourself" });
    }

    const result = await db.delete(users).where(eq(users.id, id));
    // result type depends on driver, but usually if rowCount > 0
    
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

export default router;
