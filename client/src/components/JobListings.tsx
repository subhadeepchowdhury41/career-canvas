import { useState, useMemo } from 'react';
import { Briefcase } from 'lucide-react';
import { JobCard, type Job } from './JobCard';
import { JobFilters, type JobFiltersState } from './JobFilters';

interface JobListingsProps {
  jobs: Job[];
  companySlug?: string;
  onViewJob?: (jobSlug: string) => void;
}

export function JobListings({ jobs, companySlug, onViewJob }: JobListingsProps) {
  const [filters, setFilters] = useState<JobFiltersState>({
    search: '',
    location: '',
    department: '',
    workPolicy: '',
    employmentType: '',
  });

  const locations = useMemo(() => 
    Array.from(new Set(jobs.map(j => j.location))).sort(),
    [jobs]
  );

  const departments = useMemo(() => 
    Array.from(new Set(jobs.map(j => j.department))).sort(),
    [jobs]
  );

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      if (filters.search && !job.title.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.location && job.location !== filters.location) {
        return false;
      }
      if (filters.department && job.department !== filters.department) {
        return false;
      }
      if (filters.workPolicy && job.workPolicy !== filters.workPolicy) {
        return false;
      }
      if (filters.employmentType && job.employmentType !== filters.employmentType) {
        return false;
      }
      return true;
    });
  }, [jobs, filters]);

  return (
    <section className="py-16 px-4" id="open-positions">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-2 text-center" data-testid="text-open-positions">
          Open Positions
        </h2>
        <p className="text-muted-foreground text-center mb-8">
          {jobs.length} open {jobs.length === 1 ? 'role' : 'roles'} available
        </p>

        <div className="mb-8">
          <JobFilters
            filters={filters}
            onFiltersChange={setFilters}
            locations={locations}
            departments={departments}
          />
        </div>

        {filteredJobs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2" data-testid="text-no-jobs">No jobs match your filters</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Showing {filteredJobs.length} of {jobs.length} positions
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  companySlug={companySlug}
                  onViewDetails={onViewJob}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
