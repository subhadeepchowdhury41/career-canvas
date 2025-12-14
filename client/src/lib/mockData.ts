// todo: remove mock functionality - this file contains sample data for the prototype
import type { Job } from '@/components/JobCard';

export const mockJobs: Job[] = [
  { id: '1', title: 'Full Stack Engineer', workPolicy: 'Remote', location: 'Berlin, Germany', department: 'Product', employmentType: 'Full time', experienceLevel: 'Senior', jobType: 'Temporary', salaryRange: 'AED 8K-12K / month', jobSlug: 'full-stack-engineer-berlin', postedDaysAgo: '40 days ago' },
  { id: '2', title: 'Business Analyst', workPolicy: 'Hybrid', location: 'Riyadh, Saudi Arabia', department: 'Customer Success', employmentType: 'Part time', experienceLevel: 'Mid-level', jobType: 'Permanent', salaryRange: 'USD 4K-6K / month', jobSlug: 'business-analyst-riyadh', postedDaysAgo: '5 days ago' },
  { id: '3', title: 'Software Engineer', workPolicy: 'Remote', location: 'Berlin, Germany', department: 'Sales', employmentType: 'Contract', experienceLevel: 'Senior', jobType: 'Permanent', salaryRange: 'SAR 10K-18K / month', jobSlug: 'software-engineer-berlin', postedDaysAgo: '32 days ago' },
  { id: '4', title: 'Marketing Manager', workPolicy: 'Hybrid', location: 'Boston, United States', department: 'Engineering', employmentType: 'Part time', experienceLevel: 'Mid-level', jobType: 'Temporary', salaryRange: 'AED 8K-12K / month', jobSlug: 'marketing-manager-boston', postedDaysAgo: '22 days ago' },
  { id: '5', title: 'UX Researcher', workPolicy: 'Hybrid', location: 'Boston, United States', department: 'Engineering', employmentType: 'Full time', experienceLevel: 'Senior', jobType: 'Permanent', salaryRange: 'USD 4K-6K / month', jobSlug: 'ux-researcher-boston', postedDaysAgo: '31 days ago' },
  { id: '6', title: 'AI Product Manager', workPolicy: 'On-site', location: 'Athens, Greece', department: 'Operations', employmentType: 'Full time', experienceLevel: 'Junior', jobType: 'Internship', salaryRange: 'INR 8L-15L / year', jobSlug: 'ai-product-manager-athens', postedDaysAgo: '37 days ago' },
  { id: '7', title: 'Sales Development Representative', workPolicy: 'Remote', location: 'Berlin, Germany', department: 'Marketing', employmentType: 'Full time', experienceLevel: 'Mid-level', jobType: 'Temporary', salaryRange: 'INR 8L-15L / year', jobSlug: 'sales-development-representative-berlin', postedDaysAgo: '27 days ago' },
  { id: '8', title: 'Frontend Engineer', workPolicy: 'Hybrid', location: 'Athens, Greece', department: 'Engineering', employmentType: 'Part time', experienceLevel: 'Junior', jobType: 'Temporary', salaryRange: 'USD 80K-120K / year', jobSlug: 'frontend-engineer-athens', postedDaysAgo: '59 days ago' },
  { id: '9', title: 'Sales Development Representative', workPolicy: 'On-site', location: 'Cairo, Egypt', department: 'Sales', employmentType: 'Contract', experienceLevel: 'Senior', jobType: 'Internship', salaryRange: 'USD 4K-6K / month', jobSlug: 'sales-development-representative-cairo', postedDaysAgo: 'Posted today' },
  { id: '10', title: 'Data Analyst', workPolicy: 'On-site', location: 'Dubai, United Arab Emirates', department: 'Customer Success', employmentType: 'Full time', experienceLevel: 'Mid-level', jobType: 'Permanent', salaryRange: 'AED 8K-12K / month', jobSlug: 'data-analyst-dubai', postedDaysAgo: '53 days ago' },
  { id: '11', title: 'Solutions Consultant', workPolicy: 'Hybrid', location: 'Hyderabad, India', department: 'Engineering', employmentType: 'Contract', experienceLevel: 'Junior', jobType: 'Internship', salaryRange: 'AED 8K-12K / month', jobSlug: 'solutions-consultant-hyderabad', postedDaysAgo: '41 days ago' },
  { id: '12', title: 'Mobile Developer (Flutter)', workPolicy: 'Hybrid', location: 'Athens, Greece', department: 'Operations', employmentType: 'Part time', experienceLevel: 'Senior', jobType: 'Permanent', salaryRange: 'USD 80K-120K / year', jobSlug: 'mobile-developer-flutter-athens', postedDaysAgo: '43 days ago' },
  { id: '13', title: 'Operations Associate', workPolicy: 'Hybrid', location: 'Bangalore, India', department: 'Analytics', employmentType: 'Contract', experienceLevel: 'Junior', jobType: 'Internship', salaryRange: 'SAR 10K-18K / month', jobSlug: 'operations-associate-bangalore', postedDaysAgo: '16 days ago' },
];

export const mockCompanies = [
  { id: 'acme-corp', name: 'Acme Corp', slug: 'acme-corp', recruiterCount: 3, status: 'active' as const },
  { id: 'tech-startup', name: 'Tech Startup', slug: 'tech-startup', recruiterCount: 1, status: 'active' as const },
  { id: 'global-inc', name: 'Global Inc', slug: 'global-inc', recruiterCount: 5, status: 'draft' as const },
];

export const mockSections = [
  { id: '1', type: 'about' as const, title: 'About Us', content: 'We are a leading technology company dedicated to building innovative solutions that transform how businesses operate. Founded in 2015, we have grown from a small startup to a global team of 500+ employees.', order: 1 },
  { id: '2', type: 'culture' as const, title: 'Life at Acme', content: 'We believe in fostering a culture of innovation, collaboration, and continuous learning.', order: 2, items: [
    { icon: 'users', title: 'Collaborative', description: 'Work with talented people from diverse backgrounds' },
    { icon: 'zap', title: 'Fast-paced', description: 'Move quickly and ship products that matter' },
    { icon: 'heart', title: 'Inclusive', description: 'Everyone belongs and has a voice here' },
  ]},
  { id: '3', type: 'benefits' as const, title: 'Benefits & Perks', content: 'We take care of our team with competitive compensation and comprehensive benefits.', order: 3, items: [
    { icon: 'heart', title: 'Health Insurance', description: 'Full medical, dental, and vision coverage' },
    { icon: 'coffee', title: 'Flexible Schedule', description: 'Work when you are most productive' },
    { icon: 'globe', title: 'Remote First', description: 'Work from anywhere in the world' },
    { icon: 'rocket', title: 'Learning Budget', description: '$2,000 annual professional development' },
  ]},
];

export const mockBrandSettings = {
  primaryColor: '#2563eb',
  secondaryColor: '#64748b',
  logoUrl: '',
  bannerUrl: '',
  cultureVideoUrl: '',
  tagline: 'Join Our Team',
  description: 'Build the future with us. We are looking for passionate individuals who want to make a difference.',
};
