import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { companies } from "./company.model";

export const workPolicies = ["Remote", "Hybrid", "On-site"] as const;
export type WorkPolicy = typeof workPolicies[number];

export const jobStatuses = ["active", "draft", "closed", "archived"] as const;
export type JobStatus = typeof jobStatuses[number];

export const departments = [
  "Engineering",
  "Design",
  "Product",
  "Marketing",
  "Sales",
  "Customer Success",
  "HR",
  "Finance",
  "Operations",
  "Legal"
] as const;

export const employmentTypes = [
  "Full-time",
  "Part-time",
  "Contract",
  "Freelance",
  "Internship",
  "Temporary"
] as const;

export const experienceLevels = [
  "Intern",
  "Entry Level",
  "Mid-Level",
  "Senior",
  "Lead",
  "Manager",
  "Director",
  "Executive"
] as const;

export const jobTypes = [
  "Permanent",
  "Internship",
  "Temporary"
] as const;

export const jobs = pgTable("jobs", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  companyId: varchar("company_id", { length: 36 }).notNull().references(() => companies.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  workPolicy: text("work_policy", { enum: workPolicies }).notNull(),
  location: text("location").notNull(),
  department: text("department").notNull(),
  employmentType: text("employment_type").notNull(),
  experienceLevel: text("experience_level").notNull(),
  jobType: text("job_type").notNull(),
  salaryRange: text("salary_range").notNull(),
  jobSlug: text("job_slug").notNull(),
  description: text("description"),
  requirements: text("requirements"),
  responsibilities: text("responsibilities"),
  postedAt: timestamp("posted_at").notNull().defaultNow(),
  status: text("status", { enum: jobStatuses }).notNull().default("draft"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const jobsRelations = relations(jobs, ({ one }) => ({
  company: one(companies, {
    fields: [jobs.companyId],
    references: [companies.id],
  }),
}));

// Zod schemas
export const insertJobSchema = createInsertSchema(jobs, {
  title: z.string().min(1, "Job title is required"),
  workPolicy: z.enum(workPolicies),
  location: z.string().min(1, "Location is required"),
  department: z.string().min(1, "Department is required"),
  employmentType: z.string().min(1, "Employment type is required"),
  experienceLevel: z.string().min(1, "Experience level is required"),
  jobType: z.string().min(1, "Job type is required"),
  salaryRange: z.string().min(1, "Salary range is required"),
  jobSlug: z.string().min(1, "Job slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  requirements: z.string().optional(),
  responsibilities: z.string().optional(),
  status: z.enum(jobStatuses).default("draft"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  postedAt: true,
});

export const selectJobSchema = createSelectSchema(jobs);

export const updateJobSchema = insertJobSchema.partial().omit({
  companyId: true,
});

// TypeScript types
export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type UpdateJob = z.infer<typeof updateJobSchema>;
