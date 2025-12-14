import { JobDetail } from '../JobDetail';
import { mockJobs } from '@/lib/mockData';

export default function JobDetailExample() {
  return (
    <JobDetail
      job={mockJobs[0]}
      companyName="Acme Corp"
      companySlug="acme-corp"
      onBack={() => console.log('Go back')}
    />
  );
}
