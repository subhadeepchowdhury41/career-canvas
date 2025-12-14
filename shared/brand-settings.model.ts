import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { companies } from "./company.model";

export const brandSettings = pgTable("brand_settings", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  companyId: varchar("company_id", { length: 36 }).notNull().unique().references(() => companies.id, { onDelete: "cascade" }),
  primaryColor: text("primary_color").notNull().default("#000000"),
  secondaryColor: text("secondary_color").notNull().default("#ffffff"),
  logoUrl: text("logo_url").default(""),
  bannerUrl: text("banner_url").default(""),
  cultureVideoUrl: text("culture_video_url").default(""),
  tagline: text("tagline").default(""),
  description: text("description").default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

// Zod schemas
export const insertBrandSettingsSchema = createInsertSchema(brandSettings, {
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format").default("#000000"),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format").default("#ffffff"),
  logoUrl: z.string().refine(val => val === "" || val.startsWith("/") || z.string().url().safeParse(val).success, "Must be a valid URL or path").optional().default(""),
  bannerUrl: z.string().refine(val => val === "" || val.startsWith("/") || z.string().url().safeParse(val).success, "Must be a valid URL or path").optional().default(""),
  cultureVideoUrl: z.string().refine(val => val === "" || val.startsWith("/") || z.string().url().safeParse(val).success, "Must be a valid URL or path").optional().default(""),
  tagline: z.string().optional(),
  description: z.string().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectBrandSettingsSchema = createSelectSchema(brandSettings);

export const updateBrandSettingsSchema = insertBrandSettingsSchema.partial().omit({
  companyId: true,
});

// TypeScript types
export type BrandSettings = typeof brandSettings.$inferSelect;
export type InsertBrandSettings = z.infer<typeof insertBrandSettingsSchema>;
export type UpdateBrandSettings = z.infer<typeof updateBrandSettingsSchema>;
