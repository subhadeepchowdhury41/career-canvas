import { pgTable, text, varchar, timestamp, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { companies } from "./company.model";

export const contentSections = pgTable("content_sections", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  companyId: varchar("company_id", { length: 36 }).notNull().references(() => companies.id, { onDelete: "cascade" }),
  type: text("type").notNull().default("about"),
  title: text("title").notNull(),
  content: text("content").notNull(),
  items: json("items").$type<Array<{ icon?: string; title: string; description: string }>>().default([]),
  order: integer("order").notNull().default(0),
  isVisible: boolean("is_visible").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

// Zod schemas
export const insertContentSectionSchema = createInsertSchema(contentSections, {
  type: z.enum(["about", "culture", "benefits", "values", "team", "video"]),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  items: z.array(z.object({
    icon: z.string().optional(),
    title: z.string(),
    description: z.string(),
  })).optional(),
  order: z.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectContentSectionSchema = createSelectSchema(contentSections);

export const updateContentSectionSchema = insertContentSectionSchema.partial().omit({
  companyId: true,
});

// TypeScript types
export type ContentSection = typeof contentSections.$inferSelect;
export type InsertContentSection = z.infer<typeof insertContentSectionSchema>;
export type UpdateContentSection = z.infer<typeof updateContentSectionSchema>;
