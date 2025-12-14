# ATS Careers Page Builder - Design Guidelines

## Design Approach

**Hybrid Strategy:**
- **Admin/Recruiter Panels:** Design system approach (Material Design-inspired) for productivity and data management
- **Candidate Careers Pages:** Reference-based approach drawing from modern careers sites (Greenhouse, Lever, Linear, Stripe careers pages)

## Typography

**Font Families:**
- Primary: Inter (headings, UI elements, body text)
- Monospace: JetBrains Mono (job IDs, technical details)

**Hierarchy:**
- Admin/Recruiter: text-sm for body, text-base for labels, text-lg/xl for headings
- Candidate Pages: text-base/lg for body, text-3xl to text-6xl for hero headings

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24, 32
- Tight spacing: p-2, gap-2 for compact data tables
- Standard: p-4, gap-4 for form fields and cards
- Generous: p-8, p-12 for section padding on careers pages

**Container Strategy:**
- Admin/Recruiter panels: max-w-7xl with sidebar navigation
- Candidate careers pages: Full-width sections with inner max-w-6xl containers

## Panel-Specific Design

### Admin Panel (/admin)

**Layout:**
- Persistent left sidebar (w-64) with navigation menu
- Main content area with data tables and management forms
- Top bar with user profile and notifications

**Components:**
- **Company Management Table:** Sortable columns (Company Name, Slug, Recruiter Count, Status), row actions (Edit, View, Delete)
- **User Assignment Interface:** Multi-select dropdowns, role badges (Admin, Recruiter in distinct styles)
- **Data Tables:** Zebra striping, hover states, pagination controls at bottom
- **Forms:** Two-column layout on desktop, single column on mobile, clear field grouping with borders

### Recruiter Panel (/login, /company-slug/edit, /company-slug/preview)

**Login Page:**
- Centered card (max-w-md) with company logo placeholder at top
- Email/password fields with clear labels and validation messages
- Primary CTA button (full width)
- Minimal design with focus on functionality

**Edit Dashboard:**
- Three-tab navigation: Brand Settings, Content Sections, Preview
- **Brand Settings Tab:**
  - Color picker inputs for primary/secondary colors (show live preview swatches)
  - Logo upload zone with drag-drop area and thumbnail preview
  - Banner image upload (16:9 aspect ratio preview)
  - Culture video URL input with embed preview
  
- **Content Sections Tab:**
  - Drag-to-reorder section list with handle icons
  - Add Section dropdown (About Us, Life at Company, Benefits, Team, Culture, Values)
  - Each section card shows: section type, preview text, edit/delete actions
  - Rich text editor for section content (WYSIWYG toolbar)
  
- **Preview Mode:**
  - Full-screen preview in iframe or toggle between desktop/mobile/tablet views
  - Floating action bar: "Publish Changes" (primary), "Discard" (secondary), "Exit Preview"

**UI Patterns:**
- Sidebar navigation: Company name at top, tabs below, Settings/Logout at bottom
- Save state indicator: "All changes saved" or "Saving..." in top right
- Action buttons: Primary (filled), Secondary (outlined), Danger (red for delete)

### Candidate Careers Page (/company-slug/careers)

**Hero Section:**
- Full-width background image (company banner) with overlay gradient
- Centered company logo (h-20 to h-32)
- Large headline: text-5xl font-bold (e.g., "Join Our Team" or custom tagline)
- Subheadline: text-xl describing company mission
- Primary CTA button ("View Open Positions") with blurred backdrop-blur-sm bg-white/20 background
- Height: min-h-screen on desktop, min-h-[60vh] on mobile

**Content Sections:**
Dynamic sections based on recruiter configuration, typical flow:
1. **About Us:** Two-column layout (text + image), max-w-5xl container
2. **Life at Company:** Three-column grid of culture highlights with icons
3. **Values/Culture Video:** Centered video embed (aspect-video) with heading
4. **Benefits:** Four-column grid (2 on tablet, 1 on mobile) with icon, title, description cards
5. **Open Positions Section:** Transitions to job listings (see below)

**Job Listings Interface:**
- Section heading: "Open Positions" (text-4xl font-bold)
- **Filters Row:**
  - Search bar (w-full md:w-96) with magnifying glass icon: "Search by job title..."
  - Filter chips: Location, Department, Job Type, Work Policy (multi-select dropdowns)
  - Active filters shown as dismissible tags below
  
- **Job Cards Grid:**
  - Three-column grid on desktop (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
  - Card design: border, rounded-lg, p-6, hover:shadow-lg transition
  - Card content: Job title (text-xl font-semibold), Department badge, Location with pin icon, Work policy chip (Remote/Hybrid/On-site), Employment type, Salary range, "Posted X days ago" timestamp
  - CTA: "View Details" link (underline on hover)

- **Empty State:** Centered illustration placeholder + "No jobs match your filters" message

**Job Detail Page (/company-slug/careers/job-slug):**
- Breadcrumb navigation: Company > Careers > Job Title
- Two-column layout (8/4 split):
  - **Left Column:** Job title (text-4xl), department/location metadata row, job description (prose formatting), responsibilities list, requirements list, benefits section
  - **Right Column (Sticky):** Application card with "Apply Now" CTA (note: links to external form), job metadata (Salary, Type, Experience Level in definition list format), social share buttons
  
**Footer:**
- Company logo, brief about text
- Quick links: About, Careers, Contact
- Social media icons
- Copyright notice

**Mobile Optimization:**
- Stack all multi-column layouts to single column
- Sticky filter button that opens modal with filter controls
- Collapsible job card sections
- Bottom sticky "Apply Now" bar on job detail pages

## Component Library

**Buttons:**
- Primary: Filled with company primary color, px-6 py-3, rounded-lg, font-semibold
- Secondary: Outlined, same padding, transparent background
- Ghost: No background, underline on hover for tertiary actions

**Cards:**
- Subtle border (border-gray-200), rounded-lg, p-6
- Hover state: shadow-md elevation
- Section cards use p-8 to p-12 with more breathing room

**Form Inputs:**
- Labels: text-sm font-medium, mb-2
- Inputs: border, rounded-md, px-4 py-2, focus:ring-2 outline-none
- Validation: Error messages in text-sm text-red-600 below input

**Badges/Chips:**
- Small: px-2 py-1, text-xs, rounded-full
- Department badges: filled background with contrasting text
- Work policy chips: outlined style

**Navigation:**
- Admin/Recruiter: Vertical sidebar with icons + labels
- Candidate pages: Horizontal top nav (if needed) or minimal header with logo only

## Images

**Hero Image:**
- Large hero background image on careers page showing office environment, team collaboration, or brand imagery
- Dimensions: 1920x1080 minimum, center-focused composition
- Overlay: gradient from transparent to dark (bottom) for text readability

**Section Images:**
- About Us section: Office/team photo (landscape orientation)
- Culture section: Candid workplace moments or team events
- Benefits: Icon illustrations (not photos) for each benefit card

**Logo Usage:**
- Company logo in hero: centered, white version on dark overlay
- Header/footer logo: natural colors, h-8 to h-12 sizing

## Accessibility

- All form inputs have associated labels with for attributes
- Focus indicators: ring-2 with appropriate color on all interactive elements
- Color contrast: Minimum 4.5:1 for body text, 3:1 for large text
- Keyboard navigation: Tab order follows visual hierarchy, Escape closes modals
- ARIA labels on icon-only buttons, role attributes on custom components
- Skip to content link for screen readers

## SEO Implementation

**Meta Tags (Careers Pages):**
- Title: "[Company Name] Careers - Join Our Team"
- Description: Company tagline + "Explore open positions"
- Open Graph tags for social sharing with company banner image

**Structured Data:**
- JSON-LD JobPosting schema on job detail pages (title, location, salary, datePosted, employmentType)
- Organization schema on main careers page

## Animations

Use sparingly:
- Page transitions: fade in on route change (200ms)
- Card hover: shadow elevation (150ms ease)
- Button interactions: scale on active (95%), native hover states
- Section reveals on careers pages: fade-up on scroll (intersection observer) - only on first viewport load