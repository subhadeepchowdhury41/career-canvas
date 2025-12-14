import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { jobs } from "./job.model";
import { users } from "./user.model";

export const companyStatuses = ["active", "draft", "archived"] as const;
export type CompanyStatus = typeof companyStatuses[number];

export const companies = pgTable("companies", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  status: text("status", { enum: companyStatuses }).notNull().default("draft"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const companiesRelations = relations(companies, ({ many }) => ({
  jobs: many(jobs),
  users: many(users),
}));

// Zod schemas
export const insertCompanySchema = createInsertSchema(companies, {
  name: z.string().min(1, "Company name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  status: z.enum(companyStatuses).default("draft"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectCompanySchema = createSelectSchema(companies);

export const updateCompanySchema = insertCompanySchema.partial();

// TypeScript types
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type UpdateCompany = z.infer<typeof updateCompanySchema>;
