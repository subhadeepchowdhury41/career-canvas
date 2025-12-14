import { Router, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { brandSettings, companies, users, insertBrandSettingsSchema, updateBrandSettingsSchema } from "@shared/schema";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

/**
 * GET /api/companies/:companySlug/brand
 * Get brand settings for a company
 */
router.get("/:companySlug/brand", async (req: Request, res: Response) => {
  try {
    const { companySlug } = req.params;

    // Find company
    const company = await db.query.companies.findFirst({
      where: eq(companies.slug, companySlug),
    });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Get brand settings
    const settings = await db.query.brandSettings.findFirst({
      where: eq(brandSettings.companyId, company.id),
    });

    if (!settings) {
      // Return default settings if none exist
      return res.json({
        brandSettings: {
          companyId: company.id,
          primaryColor: "#000000",
          secondaryColor: "#ffffff",
          logoUrl: "",
          bannerUrl: "",
          cultureVideoUrl: "",
          tagline: "",
          description: "",
        },
      });
    }

    res.json({ brandSettings: settings });
  } catch (error: any) {
    console.error("Get brand settings error:", error);
    res.status(500).json({ message: "Failed to fetch brand settings" });
  }
});

/**
 * PUT /api/companies/:companySlug/brand
 * Update brand settings (admin or company recruiter)
 */
router.put("/:companySlug/brand", authenticate, async (req: Request, res: Response) => {
  try {
    const { companySlug } = req.params;
    const validatedData = updateBrandSettingsSchema.parse(req.body);

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
      const user = await db.query.users.findFirst({
        where: eq(users.id, req.user!.userId),
      });

      if (!user || user.companyId !== company.id || user.role !== "recruiter") {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    // Check if brand settings exist
    const existingSettings = await db.query.brandSettings.findFirst({
      where: eq(brandSettings.companyId, company.id),
    });

    let updatedSettings;

    if (existingSettings) {
      // Update existing settings
      [updatedSettings] = await db
        .update(brandSettings)
        .set(validatedData)
        .where(eq(brandSettings.id, existingSettings.id))
        .returning();
    } else {
      // Create new settings
      [updatedSettings] = await db
        .insert(brandSettings)
        .values({
          companyId: company.id,
          ...validatedData,
        })
        .returning();
    }

    res.json({
      message: "Brand settings updated successfully",
      brandSettings: updatedSettings,
    });
  } catch (error: any) {
    console.error("Update brand settings error:", error);
    res.status(400).json({ message: error.message || "Failed to update brand settings" });
  }
});

export default router;
