import { db } from "../db";
import { users, companies, jobs, brandSettings } from "@shared/schema";
import { hashPassword } from "../utils/auth.utils";
import sampleUsers from "../data/sample-users.json";

async function seed() {
  try {
    console.log("🌱 Starting database seeding...");

    // Create companies first
    console.log("Creating companies...");
    
    const [acmeCorp] = await db.insert(companies).values({
      name: "Acme Corporation",
      slug: "acme-corp",
      status: "active",
    }).returning();

    const [techCorp] = await db.insert(companies).values({
      name: "Tech Corp",
      slug: "tech-corp",
      status: "active",
    }).returning();

    console.log(`✓ Created ${2} companies`);

    // Create users
    console.log("Creating users...");
    
    const createdUsers = [];
    
    for (const userData of sampleUsers) {
      const hashedPassword = await hashPassword(userData.password);
      
      let companyId = null;
      if (userData.companySlug === "acme-corp") {
        companyId = acmeCorp.id;
      } else if (userData.companySlug === "tech-corp") {
        companyId = techCorp.id;
      }

      const [user] = await db.insert(users).values({
        email: userData.email,
        username: userData.username,
        password: hashedPassword,
        name: userData.name,
        role: userData.role as any,
        companyId,
      }).returning();

      createdUsers.push(user);
      console.log(`  ✓ Created user: ${user.email} (${user.role})`);
    }

    // Create brand settings for companies
    console.log("Creating brand settings...");
    
    await db.insert(brandSettings).values({
      companyId: acmeCorp.id,
      primaryColor: "#3b82f6",
      secondaryColor: "#1e40af",
      logoUrl: "https://via.placeholder.com/200x60?text=Acme+Corp",
      bannerUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&h=1080&fit=crop",
      tagline: "Join Our Team at Acme Corp",
      description: "We're building the future of technology. Join our team of innovators and make an impact.",
    });

    await db.insert(brandSettings).values({
      companyId: techCorp.id,
      primaryColor: "#10b981",
      secondaryColor: "#059669",
      logoUrl: "https://via.placeholder.com/200x60?text=Tech+Corp",
      bannerUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&h=1080&fit=crop",
      tagline: "Innovate with Tech Corp",
      description: "Join a team that's passionate about creating cutting-edge solutions.",
    });

    console.log(`✓ Created brand settings for ${2} companies`);

    // Create sample jobs
    console.log("Creating sample jobs...");
    
    const sampleJobs = [
      {
        companyId: acmeCorp.id,
        title: "Full Stack Engineer",
        workPolicy: "Remote" as const,
        location: "Berlin, Germany",
        department: "Engineering",
        employmentType: "Full-time",
        experienceLevel: "Senior",
        jobType: "Permanent",
        salaryRange: "€80K–€120K / year",
        jobSlug: "full-stack-engineer-berlin",
        description: "We're looking for an experienced Full Stack Engineer to join our team.",
        requirements: "5+ years of experience with React, Node.js, and PostgreSQL",
        responsibilities: "Build and maintain web applications, collaborate with the team",
        status: "active" as const,
      },
      {
        companyId: acmeCorp.id,
        title: "Product Designer",
        workPolicy: "Hybrid" as const,
        location: "Berlin, Germany",
        department: "Product",
        employmentType: "Full-time",
        experienceLevel: "Mid-Level",
        jobType: "Permanent",
        salaryRange: "€60K–€90K / year",
        jobSlug: "product-designer-berlin",
        description: "Join our design team to create beautiful user experiences.",
        requirements: "3+ years of experience with Figma and design systems",
        responsibilities: "Design user interfaces, conduct user research",
        status: "active" as const,
      },
      {
        companyId: techCorp.id,
        title: "DevOps Engineer",
        workPolicy: "Remote" as const,
        location: "London, UK",
        department: "Engineering",
        employmentType: "Full-time",
        experienceLevel: "Senior",
        jobType: "Permanent",
        salaryRange: "£70K–£100K / year",
        jobSlug: "devops-engineer-london",
        description: "Help us build and maintain our cloud infrastructure.",
        requirements: "Experience with AWS, Docker, and Kubernetes",
        responsibilities: "Manage infrastructure, automate deployments",
        status: "active" as const,
      },
      {
        companyId: techCorp.id,
        title: "Frontend Developer",
        workPolicy: "On-site" as const,
        location: "London, UK",
        department: "Engineering",
        employmentType: "Full-time",
        experienceLevel: "Entry Level",
        jobType: "Permanent",
        salaryRange: "£40K–£60K / year",
        jobSlug: "frontend-developer-london",
        description: "Start your career as a Frontend Developer with us.",
        requirements: "Knowledge of React and TypeScript",
        responsibilities: "Build user interfaces, write clean code",
        status: "active" as const,
      },
    ];

    for (const jobData of sampleJobs) {
      await db.insert(jobs).values(jobData);
    }

    console.log(`✓ Created ${sampleJobs.length} sample jobs`);

    console.log("\n✅ Database seeding completed successfully!");
    console.log("\nSample credentials:");
    console.log("  Admin: admin@example.com / password123");
    console.log("  Recruiter (Acme): recruiter@acme.com / password123");
    console.log("  Recruiter (Tech): recruiter2@techcorp.com / password123");
    console.log("  Candidate: candidate@example.com / password123");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Run the seed function
seed();
