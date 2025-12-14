import { JobCard } from '../JobCard';

const mockJob = {
  id: '1',
  title: 'Full Stack Engineer',
  workPolicy: 'Remote' as const,
  location: 'Berlin, Germany',
  department: 'Product',
  employmentType: 'Full time',
  experienceLevel: 'Senior',
  jobType: 'Temporary',
  salaryRange: 'AED 8K-12K / month',
  jobSlug: 'full-stack-engineer-berlin',
  postedDaysAgo: '40 days ago',
};

export default function JobCardExample() {
  return (
    <div className="max-w-sm">
      <JobCard 
        job={mockJob} 
        onViewDetails={(slug) => console.log('View job:', slug)} 
      />
    </div>
  );
}
