import { useState } from 'react';
import { JobFilters, type JobFiltersState } from '../JobFilters';

const locations = ['Berlin, Germany', 'Boston, United States', 'Athens, Greece', 'Dubai, UAE'];
const departments = ['Engineering', 'Product', 'Sales', 'Marketing', 'Operations'];

export default function JobFiltersExample() {
  const [filters, setFilters] = useState<JobFiltersState>({
    search: '',
    location: '',
    department: '',
    workPolicy: '',
    employmentType: '',
  });

  return (
    <div className="w-full max-w-4xl">
      <JobFilters
        filters={filters}
        onFiltersChange={setFilters}
        locations={locations}
        departments={departments}
      />
    </div>
  );
}
