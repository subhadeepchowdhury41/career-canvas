import { Router, type Request, type Response } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db } from "../db";
import { jobs, companies, users, insertJobSchema, updateJobSchema } from "@shared/schema";
import { authenticate, optionalAuthenticate } from "../middleware/auth.middleware";

const router = Router();

/**
 * GET /api/jobs
 * List all active jobs across all companies
 */
router.get("/jobs", async (req: Request, res: Response) => {
  try {
    const jobsList = await db.query.jobs.findMany({
      where: eq(jobs.status, "active"),
      orderBy: [desc(jobs.postedAt)],
      with: {
        company: true, // We need company details for the card
      }
    });

    // Calculate days ago for each job
    const jobsWithDaysAgo = jobsList.map(job => {
      const daysAgo = Math.max(0, Math.floor((Date.now() - job.postedAt.getTime()) / (1000 * 60 * 60 * 24)));
      let postedDaysAgo;
      
      if (daysAgo === 0) {
        postedDaysAgo = "Posted today";
      } else if (daysAgo === 1) {
        postedDaysAgo = "1 day ago";
      } else {
        postedDaysAgo = `${daysAgo} days ago`;
      }

      return {
        ...job,
        postedDaysAgo,
      };
    });

    res.json({ jobs: jobsWithDaysAgo });
  } catch (error: any) {
    console.error("Get all jobs error:", error);
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
});

/**
 * GET /api/companies/:companySlug/jobs
 * List all jobs for a company
 */
router.get("/companies/:companySlug/jobs", optionalAuthenticate, async (req: Request, res: Response) => {
  try {
    const { companySlug } = req.params;

    // Find company
    const company = await db.query.companies.findFirst({
      where: eq(companies.slug, companySlug),
    });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Get jobs - only show active jobs to non-authenticated users
    const isAuthenticated = !!req.user;
    const isAdmin = req.user?.role === "admin";
    const isCompanyRecruiter = req.user?.role === "recruiter";

    let jobsList;
    
    if (isAdmin || isCompanyRecruiter) {
      // Show all jobs to admin and company recruiters
      jobsList = await db.query.jobs.findMany({
        where: eq(jobs.companyId, company.id),
        orderBy: [desc(jobs.postedAt)],
      });
    } else {
      // Show only active jobs to others
      jobsList = await db.query.jobs.findMany({
        where: and(
          eq(jobs.companyId, company.id),
          eq(jobs.status, "active")
        ),
        orderBy: [desc(jobs.postedAt)],
      });
    }

    // Calculate days ago for each job
    const jobsWithDaysAgo = jobsList.map(job => {
      const daysAgo = Math.max(0, Math.floor((Date.now() - job.postedAt.getTime()) / (1000 * 60 * 60 * 24)));
      let postedDaysAgo;
      
      if (daysAgo === 0) {
        postedDaysAgo = "Posted today";
      } else if (daysAgo === 1) {
        postedDaysAgo = "1 day ago";
      } else {
        postedDaysAgo = `${daysAgo} days ago`;
      }

      return {
        ...job,
        postedDaysAgo,
      };
    });

    res.json({ jobs: jobsWithDaysAgo });
  } catch (error: any) {
    console.error("Get jobs error:", error);
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
});

/**
 * GET /api/companies/:companySlug/jobs/:jobSlug
 * Get job details
 */
router.get("/companies/:companySlug/jobs/:jobSlug", async (req: Request, res: Response) => {
  try {
    const { companySlug, jobSlug } = req.params;

    // Find company
    const company = await db.query.companies.findFirst({
      where: eq(companies.slug, companySlug),
    });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Find job
    const job = await db.query.jobs.findFirst({
      where: and(
        eq(jobs.companyId, company.id),
        eq(jobs.jobSlug, jobSlug)
      ),
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Calculate days ago
    const daysAgo = Math.max(0, Math.floor((Date.now() - job.postedAt.getTime()) / (1000 * 60 * 60 * 24)));
    let postedDaysAgo;
    
    if (daysAgo === 0) {
      postedDaysAgo = "Posted today";
    } else if (daysAgo === 1) {
      postedDaysAgo = "1 day ago";
    } else {
      postedDaysAgo = `${daysAgo} days ago`;
    }

    res.json({ 
      job: {
        ...job,
        postedDaysAgo,
      }
    });
  } catch (error: any) {
    console.error("Get job error:", error);
    res.status(500).json({ message: "Failed to fetch job" });
  }
});

/**
 * POST /api/companies/:companySlug/jobs
 * Create a new job (admin or company recruiter)
 */
router.post("/companies/:companySlug/jobs", authenticate, async (req: Request, res: Response) => {
  try {
    const { companySlug } = req.params;
    const validatedData = insertJobSchema.parse(req.body);

    // Find company
    const company = await db.query.companies.findFirst({
      where: eq(companies.slug, companySlug),
    });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Check permissions
    const isAdmin = req.user?.role === "admin";
    
    if (!isAdmin) {
      // Check if recruiter belongs to this company
      const user = await db.query.users.findFirst({
        where: eq(users.id, req.user!.userId),
      });

      if (!user || user.companyId !== company.id || user.role !== "recruiter") {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    // Create job
    const [newJob] = await db.insert(jobs).values({
      ...validatedData,
      companyId: company.id,
    }).returning();

    res.status(201).json({
      message: "Job created successfully",
      job: newJob,
    });
  } catch (error: any) {
    console.error("Create job error:", error);
    res.status(400).json({ message: error.message || "Failed to create job" });
  }
});

/**
 * PATCH /api/companies/:companySlug/jobs/:jobSlug
 * Update job (admin or company recruiter)
 */
router.patch("/companies/:companySlug/jobs/:jobSlug", authenticate, async (req: Request, res: Response) => {
  try {
    const { companySlug, jobSlug } = req.params;
    const validatedData = updateJobSchema.parse(req.body);

    // Find company
    const company = await db.query.companies.findFirst({
      where: eq(companies.slug, companySlug),
    });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Find job
    const job = await db.query.jobs.findFirst({
      where: and(
        eq(jobs.companyId, company.id),
        eq(jobs.jobSlug, jobSlug)
      ),
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Check permissions
    const isAdmin = req.user?.role === "admin";
    
    if (!isAdmin) {
      const user = await db.query.users.findFirst({
        where: eq(users.id, req.user!.userId),
      });

      if (!user || user.companyId !== company.id || user.role !== "recruiter") {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    // Update job
    const [updatedJob] = await db
      .update(jobs)
      .set(validatedData)
      .where(eq(jobs.id, job.id))
      .returning();

    res.json({
      message: "Job updated successfully",
      job: updatedJob,
    });
  } catch (error: any) {
    console.error("Update job error:", error);
    res.status(400).json({ message: error.message || "Failed to update job" });
  }
});

/**
 * DELETE /api/companies/:companySlug/jobs/:id
 * Delete job (admin or company recruiter)
 */
router.delete("/companies/:companySlug/jobs/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const { companySlug, id } = req.params;

    // Find company
    const company = await db.query.companies.findFirst({
      where: eq(companies.slug, companySlug),
    });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Find job
    const job = await db.query.jobs.findFirst({
      where: and(
        eq(jobs.companyId, company.id),
        eq(jobs.id, id)
      ),
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Check permissions
    const isAdmin = req.user?.role === "admin";
    
    if (!isAdmin) {
      const user = await db.query.users.findFirst({
        where: eq(users.id, req.user!.userId),
      });

      if (!user || user.companyId !== company.id || user.role !== "recruiter") {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    await db.delete(jobs).where(eq(jobs.id, id));

    res.json({ message: "Job deleted successfully" });
  } catch (error: any) {
    console.error("Delete job error:", error);
    res.status(500).json({ message: "Failed to delete job" });
  }
});

export default router;
