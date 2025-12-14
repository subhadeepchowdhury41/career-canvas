import { JobListings } from '../JobListings';
import { mockJobs } from '@/lib/mockData';

export default function JobListingsExample() {
  return (
    <JobListings
      jobs={mockJobs}
      companySlug="acme-corp"
      onViewJob={(slug) => console.log('View job:', slug)}
    />
  );
}
