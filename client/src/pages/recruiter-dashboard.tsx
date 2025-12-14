import { useState } from 'react';
import { Switch, Route, useParams } from 'wouter';
import { RecruiterSidebar } from '@/components/RecruiterSidebar';
import { BrandSettingsForm } from '@/components/BrandSettingsForm';
import { SectionEditor } from '@/components/SectionEditor';
import { JobForm } from '@/components/JobForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, MoreHorizontal, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Job } from '@/components/JobCard';
import { InsertJob } from '@shared/job.model';

function BrandSettingsPage() {
  return <BrandSettingsForm />;
}

function ContentSectionsPage() {
  return <SectionEditor />;
}

function JobManagementPage() {
  const params = useParams<{ companySlug: string }>();
  const companySlug = params.companySlug || 'acme-corp';
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  // Fetch company details to get ID
  const { data: companyData } = useQuery({
    queryKey: ['company', companySlug],
    queryFn: async () => {
      const response = await api.get(`/companies/${companySlug}`);
      return response.data;
    },
  });

  const workPolicyColors: Record<string, string> = {
    'Remote': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    'Hybrid': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    'On-site': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  };

  // Fetch jobs
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['jobs', companySlug],
    queryFn: async () => {
      const response = await api.get(`/companies/${companySlug}/jobs`);
      return response.data.jobs;
    },
  });

  // Create job mutation
  const createMutation = useMutation({
    mutationFn: async (job: InsertJob) => {
      const response = await api.post(`/companies/${companySlug}/jobs`, job);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs', companySlug] });
      toast({ title: 'Success', description: 'Job created successfully' });
      setIsJobDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create job',
        variant: 'destructive',
      });
    },
  });

  // Update job mutation
  const updateMutation = useMutation({
    mutationFn: async ({ slug, data }: { slug: string; data: InsertJob }) => {
      const response = await api.patch(`/companies/${companySlug}/jobs/${slug}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs', companySlug] });
      toast({ title: 'Success', description: 'Job updated successfully' });
      setIsJobDialogOpen(false);
      setEditingJob(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update job',
        variant: 'destructive',
      });
    },
  });

  // Delete job mutation
  const deleteMutation = useMutation({
    mutationFn: async (jobId: string) => {
      await api.delete(`/companies/${companySlug}/jobs/${jobId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs', companySlug] });
      toast({ title: 'Success', description: 'Job deleted successfully' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete job',
        variant: 'destructive',
      });
    },
  });

  const handleCreateJob = () => {
    setEditingJob(null);
    setIsJobDialogOpen(true);
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setIsJobDialogOpen(true);
  };

  const handleDeleteJob = (id: string) => {
    if (confirm('Are you sure you want to delete this job?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleJobSubmit = (data: any) => {
    if (!companyData?.company?.id) {
      toast({ title: 'Error', description: 'Company data not loaded', variant: 'destructive' });
      return;
    }

    const jobData = { ...data, companyId: companyData.company.id };

    if (editingJob) {
      updateMutation.mutate({ slug: editingJob.jobSlug, data: jobData });
    } else {
      createMutation.mutate(jobData);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Job Listings</h1>
          <p className="text-muted-foreground">Manage your open positions</p>
        </div>
        
        <Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateJob} data-testid="button-add-job">
              <Plus className="h-4 w-4 mr-2" />
              Add Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingJob ? 'Edit Job' : 'Create New Job'}</DialogTitle>
              <DialogDescription>
                Fill in the details below to posting a new job opening.
              </DialogDescription>
            </DialogHeader>
            <JobForm
              defaultValues={editingJob ? {
                ...editingJob,
                status: editingJob.status as any
              } : undefined}
              onSubmit={handleJobSubmit}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Posted</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No jobs found. Create your first job listing!
                </TableCell>
              </TableRow>
            ) : (
              jobs?.map((job: Job) => (
                <TableRow key={job.id} data-testid={`row-job-${job.id}`}>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{job.department}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{job.location}</TableCell>
                  <TableCell>
                    <Badge className={workPolicyColors[job.workPolicy] || ''}>
                      {job.workPolicy}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {job.postedDaysAgo}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditJob(job)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDeleteJob(job.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

export default function RecruiterDashboard() {
  const params = useParams<{ companySlug: string }>();
  const companySlug = params.companySlug || 'acme-corp';
  
  // We fetch company details to get the name
  const { data: company } = useQuery({
    queryKey: ['company', companySlug],
    queryFn: async () => {
      const response = await api.get(`/companies/${companySlug}`);
      return response.data;
    },
    enabled: !!companySlug,
  });

  const companyName = company?.name || companySlug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <div className="flex h-screen">
      <RecruiterSidebar companyName={companyName} companySlug={companySlug} />
      <main className="flex-1 overflow-auto p-6">
        <Switch>
          <Route path="/:companySlug/edit/sections" component={ContentSectionsPage} />
          <Route path="/:companySlug/edit/jobs" component={JobManagementPage} />
          <Route path="/:companySlug/edit" component={BrandSettingsPage} />
          <Route component={BrandSettingsPage} />
        </Switch>
      </main>
    </div>
  );
}
