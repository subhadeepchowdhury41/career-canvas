import { MapPin, Clock, Building2, Banknote, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface Job {
  id: string;
  title: string;
  workPolicy: 'Remote' | 'Hybrid' | 'On-site';
  location: string;
  department: string;
  employmentType: string;
  experienceLevel: string;
  salaryRange: string;
  jobSlug: string;
  postedDaysAgo: string;
  // Optional fields for detailed view/editing
  description?: string;
  requirements?: string;
  responsibilities?: string;
  status: 'active' | 'draft' | 'closed' | 'archived';
}

interface JobCardProps {
  job: Job;
  onViewDetails?: (jobSlug: string) => void;
  companySlug?: string;
}

const workPolicyColors: Record<string, string> = {
  'Remote': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'Hybrid': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'On-site': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
};

export function JobCard({ job, onViewDetails }: JobCardProps) {
  return (
    <Card className="hover-elevate active-elevate-2 cursor-pointer transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <CardTitle className="text-lg leading-tight">{job.title}</CardTitle>
          <Badge variant="secondary" className="shrink-0">
            {job.department}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={workPolicyColors[job.workPolicy]}>
            {job.workPolicy}
          </Badge>
          <Badge variant="outline">{job.employmentType}</Badge>
        </div>
        
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 shrink-0" />
            <span>{job.experienceLevel}</span>
          </div>
          <div className="flex items-center gap-2">
            <Banknote className="h-4 w-4 shrink-0" />
            <span>{job.salaryRange}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0" />
            <span>{job.postedDaysAgo}</span>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full mt-4"
          onClick={() => onViewDetails?.(job.jobSlug)}
          data-testid={`button-view-job-${job.jobSlug}`}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}
