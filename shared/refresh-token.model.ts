import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./user.model";

export const refreshTokens = pgTable("refresh_tokens", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Zod schemas
export const insertRefreshTokenSchema = createInsertSchema(refreshTokens, {
  token: z.string().min(1, "Token is required"),
  expiresAt: z.date(),
}).omit({
  id: true,
  createdAt: true,
});

export const selectRefreshTokenSchema = createSelectSchema(refreshTokens);

// TypeScript types
export type RefreshToken = typeof refreshTokens.$inferSelect;
export type InsertRefreshToken = z.infer<typeof insertRefreshTokenSchema>;
