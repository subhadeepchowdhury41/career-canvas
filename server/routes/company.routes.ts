import { Router, type Request, type Response } from "express";
import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { companies, users, insertCompanySchema, updateCompanySchema } from "@shared/schema";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware";

const router = Router();

/**
 * GET /api/companies
 * List all companies
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const allCompanies = await db.query.companies.findMany({
      orderBy: (companies, { desc }) => [desc(companies.createdAt)],
    });

    // Get recruiter count for each company
    const companiesWithCounts = await Promise.all(
      allCompanies.map(async (company) => {
        const recruiterCount = await db.query.users.findMany({
          where: and(
            eq(users.companyId, company.id),
            eq(users.role, "recruiter")
          ),
        });

        return {
          ...company,
          recruiterCount: recruiterCount.length,
        };
      })
    );

    res.json({ companies: companiesWithCounts });
  } catch (error: any) {
    console.error("Get companies error:", error);
    res.status(500).json({ message: "Failed to fetch companies" });
  }
});

/**
 * GET /api/companies/:slug
 * Get company by slug
 */
router.get("/:slug", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const company = await db.query.companies.findFirst({
      where: eq(companies.slug, slug),
    });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json({ company });
  } catch (error: any) {
    console.error("Get company error:", error);
    res.status(500).json({ message: "Failed to fetch company" });
  }
});

/**
 * POST /api/companies
 * Create a new company (admin only)
 */
router.post("/", authenticate, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const validatedData = insertCompanySchema.parse(req.body);

    // Check if slug already exists
    const existingCompany = await db.query.companies.findFirst({
      where: eq(companies.slug, validatedData.slug),
    });

    if (existingCompany) {
      return res.status(400).json({ message: "Company with this slug already exists" });
    }

    const [newCompany] = await db.insert(companies).values(validatedData).returning();

    res.status(201).json({
      message: "Company created successfully",
      company: newCompany,
    });
  } catch (error: any) {
    console.error("Create company error:", error);
    res.status(400).json({ message: error.message || "Failed to create company" });
  }
});

/**
 * PATCH /api/companies/:slug
 * Update company (admin or recruiter of the company)
 */
router.patch("/:slug", authenticate, async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const validatedData = updateCompanySchema.parse(req.body);

    // Find company
    const company = await db.query.companies.findFirst({
      where: eq(companies.slug, slug),
    });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Check permissions
    const isAdmin = req.user?.role === "admin";
    const isCompanyRecruiter = req.user?.role === "recruiter" && req.user?.userId;

    if (!isAdmin) {
      // Check if recruiter belongs to this company
      const user = await db.query.users.findFirst({
        where: eq(users.id, req.user!.userId),
      });

      if (!user || user.companyId !== company.id) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    // Update company
    const [updatedCompany] = await db
      .update(companies)
      .set(validatedData)
      .where(eq(companies.id, company.id))
      .returning();

    res.json({
      message: "Company updated successfully",
      company: updatedCompany,
    });
  } catch (error: any) {
    console.error("Update company error:", error);
    res.status(400).json({ message: error.message || "Failed to update company" });
  }
});

/**
 * DELETE /api/companies/:id
 * Delete company (admin only)
 */
router.delete("/:id", authenticate, requireRole("admin"), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const company = await db.query.companies.findFirst({
      where: eq(companies.id, id),
    });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    await db.delete(companies).where(eq(companies.id, id));

    res.json({ message: "Company deleted successfully" });
  } catch (error: any) {
    console.error("Delete company error:", error);
    res.status(500).json({ message: "Failed to delete company" });
  }
});

export default router;
