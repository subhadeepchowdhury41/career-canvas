import { Router } from "express";
import { db } from "../db";
import { contentSections, companies, users } from "@shared/schema";
import { eq, asc } from "drizzle-orm";
import { authenticate } from "../middleware/auth.middleware";
import { insertContentSectionSchema } from "@shared/content-section.model";

const router = Router();

router.use((req, res, next) => {
  console.log(`[ContentRouter] ${req.method} ${req.url}`);
  next();
});

router.get("/debug-content", (req, res) => res.json({ message: "Content router working" }));

// Get all sections for a company
router.get("/:companySlug/sections", async (req, res) => {
  try {
    const { companySlug } = req.params;

    const company = await db.query.companies.findFirst({
      where: eq(companies.slug, companySlug),
    });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const sections = await db.query.contentSections.findMany({
      where: eq(contentSections.companyId, company.id),
      orderBy: [asc(contentSections.order)],
    });

    res.json({ sections });
  } catch (error) {
    console.error("Error fetching sections:", error);
    res.status(500).json({ message: "Failed to fetch sections" });
  }
});

// Helper validation function
async function validateAccess(req: any, companyId: string, res: any) {
  const isAdmin = req.user.role === "admin";
  if (isAdmin) return true;

  const user = await db.query.users.findFirst({
    where: eq(users.id, req.user.userId),
  });

  if (!user || user.companyId !== companyId || user.role !== "recruiter") {
    res.status(403).json({ message: "Access denied" });
    return false;
  }
  return true;
}

// Create a new section
router.post(
  "/:companySlug/sections",
  authenticate,
  async (req, res) => {
    try {
      const { companySlug } = req.params;
      
      const company = await db.query.companies.findFirst({
        where: eq(companies.slug, companySlug),
      });

      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      if (!await validateAccess(req, company.id, res)) return;

      const validatedData = insertContentSectionSchema.parse({
        ...req.body,
        companyId: company.id,
      });

      const [section] = await db
        .insert(contentSections)
        .values(validatedData)
        .returning();

      res.status(201).json({ section });
    } catch (error: any) {
      console.error("Error creating section:", error);
      res.status(400).json({ 
        message: error.issues ? "Validation error" : "Failed to create section", 
        errors: error.issues 
      });
    }
  }
);

// Reorder sections
router.put(
  "/:companySlug/sections/reorder",
  authenticate,
  async (req, res) => {
    try {
      const { companySlug } = req.params;
      const { items } = req.body as { items: { id: string; order: number }[] };

      if (!Array.isArray(items)) {
        return res.status(400).json({ message: "Invalid items format" });
      }

      const company = await db.query.companies.findFirst({
        where: eq(companies.slug, companySlug),
      });

      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      if (!await validateAccess(req, company.id, res)) return;

      await db.transaction(async (tx) => {
        for (const item of items) {
          await tx
            .update(contentSections)
            .set({ order: item.order })
            .where(eq(contentSections.id, item.id));
        }
      });

      res.json({ message: "Sections reordered successfully" });
    } catch (error) {
      console.error("Error reordering sections:", error);
      res.status(500).json({ message: "Failed to reorder sections" });
    }
  }
);

// Update a section
router.put(
  "/:companySlug/sections/:id",
  authenticate,
  async (req, res) => {
    try {
      const { id, companySlug } = req.params;
      
      const company = await db.query.companies.findFirst({
        where: eq(companies.slug, companySlug),
      });

      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      if (!await validateAccess(req, company.id, res)) return;

      const validatedData = insertContentSectionSchema.partial().parse(req.body);

      const [section] = await db
        .update(contentSections)
        .set({ ...validatedData, updatedAt: new Date() })
        .where(eq(contentSections.id, id))
        .returning();

      if (!section) {
        return res.status(404).json({ message: "Section not found" });
      }

      res.json({ section });
    } catch (error: any) {
      console.error("Error updating section:", error);
      res.status(400).json({ 
        message: error.issues ? "Validation error" : "Failed to update section", 
        errors: error.issues 
      });
    }
  }
);

// // Delete a section
router.delete(
  "/:companySlug/sections/:id",
  authenticate,
  async (req, res) => {
    try {
      const { id, companySlug } = req.params;
      console.log("Deleting section...");
      
      const company = await db.query.companies.findFirst({
        where: eq(companies.slug, companySlug),
      });

      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      if (!await validateAccess(req, company.id, res)) return;

      const [deleted] = await db
        .delete(contentSections)
        .where(eq(contentSections.id, id))
        .returning();

      if (!deleted) {
        return res.status(404).json({ message: "Section not found" });
      }

      res.json({ message: "Section deleted successfully" });
    } catch (error) {
      console.error("Error deleting section:", error);
      res.status(500).json({ message: "Failed to delete section" });
    }
  }
);


export default router;
