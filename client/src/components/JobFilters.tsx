import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export interface JobFiltersState {
  search: string;
  location: string;
  department: string;
  workPolicy: string;
  employmentType: string;
}

interface JobFiltersProps {
  filters: JobFiltersState;
  onFiltersChange: (filters: JobFiltersState) => void;
  locations: string[];
  departments: string[];
}

export function JobFilters({ filters, onFiltersChange, locations, departments }: JobFiltersProps) {
  const workPolicies = ['Remote', 'Hybrid', 'On-site'];
  const employmentTypes = ['Full time', 'Part time', 'Contract'];

  const updateFilter = (key: keyof JobFiltersState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilter = (key: keyof JobFiltersState) => {
    onFiltersChange({ ...filters, [key]: '' });
  };

  const clearAllFilters = () => {
    onFiltersChange({ search: '', location: '', department: '', workPolicy: '', employmentType: '' });
  };

  const activeFilters = Object.entries(filters).filter(([key, value]) => value && key !== 'search');

  const FilterControls = () => (
    <div className="space-y-4">
      <Select value={filters.location} onValueChange={(v) => updateFilter('location', v)}>
        <SelectTrigger data-testid="select-location">
          <SelectValue placeholder="Location" />
        </SelectTrigger>
        <SelectContent>
          {locations.map((loc) => (
            <SelectItem key={loc} value={loc}>{loc}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.department} onValueChange={(v) => updateFilter('department', v)}>
        <SelectTrigger data-testid="select-department">
          <SelectValue placeholder="Department" />
        </SelectTrigger>
        <SelectContent>
          {departments.map((dept) => (
            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.workPolicy} onValueChange={(v) => updateFilter('workPolicy', v)}>
        <SelectTrigger data-testid="select-work-policy">
          <SelectValue placeholder="Work Policy" />
        </SelectTrigger>
        <SelectContent>
          {workPolicies.map((policy) => (
            <SelectItem key={policy} value={policy}>{policy}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.employmentType} onValueChange={(v) => updateFilter('employmentType', v)}>
        <SelectTrigger data-testid="select-employment-type">
          <SelectValue placeholder="Employment Type" />
        </SelectTrigger>
        <SelectContent>
          {employmentTypes.map((type) => (
            <SelectItem key={type} value={type}>{type}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by job title..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
            data-testid="input-search-jobs"
            aria-label="Search jobs by title"
          />
        </div>
        
        <div className="hidden md:flex gap-2 flex-wrap">
          <Select value={filters.location} onValueChange={(v) => updateFilter('location', v)}>
            <SelectTrigger className="w-40" data-testid="select-location-desktop">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.department} onValueChange={(v) => updateFilter('department', v)}>
            <SelectTrigger className="w-40" data-testid="select-department-desktop">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.workPolicy} onValueChange={(v) => updateFilter('workPolicy', v)}>
            <SelectTrigger className="w-36" data-testid="select-work-policy-desktop">
              <SelectValue placeholder="Work Policy" />
            </SelectTrigger>
            <SelectContent>
              {workPolicies.map((policy) => (
                <SelectItem key={policy} value={policy}>{policy}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.employmentType} onValueChange={(v) => updateFilter('employmentType', v)}>
            <SelectTrigger className="w-36" data-testid="select-employment-desktop">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {employmentTypes.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="md:hidden" data-testid="button-open-filters">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFilters.length > 0 && (
                <Badge variant="secondary" className="ml-2">{activeFilters.length}</Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[60vh]">
            <SheetHeader>
              <SheetTitle>Filter Jobs</SheetTitle>
            </SheetHeader>
            <div className="py-4">
              <FilterControls />
              <Button 
                variant="outline" 
                className="w-full mt-4" 
                onClick={clearAllFilters}
                data-testid="button-clear-filters-mobile"
              >
                Clear All Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {activeFilters.map(([key, value]) => (
            <Badge 
              key={key} 
              variant="secondary" 
              className="gap-1 pr-1"
            >
              {value}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 no-default-hover-elevate"
                onClick={() => clearFilter(key as keyof JobFiltersState)}
                data-testid={`button-clear-${key}`}
                aria-label={`Remove ${key} filter`}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAllFilters}
            data-testid="button-clear-all-filters"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
