import { useState } from 'react';
import { Plus, Search, MoreHorizontal, ExternalLink, Pencil, Trash2, Eye, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast, useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { queryClient } from '@/lib/queryClient';

interface Company {
  id: string;
  name: string;
  slug: string;
  recruiterCount: number;
  status: 'active' | 'draft' | 'archived';
}

export function CompanyManagement() {
  const [search, setSearch] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: '', slug: '' });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch companies
  const { data, isLoading, error } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await api.get('/companies');
      return response.data.companies as Company[];
    },
  });

  const companies = data || [];

  // Create company mutation
  const createMutation = useMutation({
    mutationFn: async (companyData: { name: string; slug: string; status: string }) => {
      const response = await api.post('/companies', companyData);
      return response.data.company;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast({
        title: 'Success',
        description: 'Company created successfully',
      });
      setNewCompany({ name: '', slug: '' });
      setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create company',
        variant: 'destructive',
      });
    },
  });


  // Update company mutation (for status)
  const updateMutation = useMutation({
    mutationFn: async ({ slug, status }: { slug: string; status: string }) => {
      const response = await api.patch(`/companies/${slug}`, { status });
      return response.data.company;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast({
        title: 'Success',
        description: 'Company status updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update company status',
        variant: 'destructive',
      });
    },
  });

  // Delete company mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/companies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast({
        title: 'Success',
        description: 'Company deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete company',
        variant: 'destructive',
      });
    },
  });

  const filteredCompanies = companies.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) ||
           c.slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateCompany = () => {
    if (!newCompany.name || !newCompany.slug) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    createMutation.mutate({
      name: newCompany.name,
      slug: newCompany.slug.toLowerCase().replace(/\s+/g, '-'),
      status: 'draft',
    });
  };

  const handleChangeStatus = (slug: string, status: string) => {
    updateMutation.mutate({ slug, status });
  };

  const handleDeleteCompany = (id: string) => {
    if (confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load companies</p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['companies'] })}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Companies</h1>
          <p className="text-muted-foreground">Manage company careers pages</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <Button onClick={() => setIsCreateDialogOpen(true)} data-testid="button-create-company">
            <Plus className="h-4 w-4 mr-2" />
            Add Company
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Company</DialogTitle>
              <DialogDescription>
                Add a new company to create their careers page
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ 
                    ...newCompany, 
                    name: e.target.value,
                    slug: e.target.value.toLowerCase().replace(/\s+/g, '-')
                  })}
                  placeholder="Acme Corporation"
                  data-testid="input-company-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-slug">URL Slug</Label>
                <Input
                  id="company-slug"
                  value={newCompany.slug}
                  onChange={(e) => setNewCompany({ ...newCompany, slug: e.target.value })}
                  placeholder="acme-corp"
                  data-testid="input-company-slug"
                />
                <p className="text-xs text-muted-foreground">
                  Careers page will be at: /{newCompany.slug || 'company-slug'}/careers
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateCompany} 
                disabled={createMutation.isPending}
                data-testid="button-confirm-create"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Company'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold" data-testid="text-total-companies">
              {isLoading ? '-' : companies.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {isLoading ? '-' : companies.filter((c) => c.status === 'active').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Recruiters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {isLoading ? '-' : companies.reduce((sum, c) => sum + c.recruiterCount, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            data-testid="input-search-companies"
          />
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-center">Recruiters</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredCompanies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No companies found
                </TableCell>
              </TableRow>
            ) : (
              filteredCompanies.map((company) => (
                <TableRow key={company.id} data-testid={`row-company-${company.id}`}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    /{company.slug}
                  </TableCell>
                  <TableCell className="text-center">{company.recruiterCount}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[company.status]}>
                      {company.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" data-testid={`button-company-actions-${company.id}`}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => window.location.href = `/${company.slug}/edit`}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(`/${company.slug}/careers`, '_blank')}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Careers Page
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(`/${company.slug}/preview`, '_blank')}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="p-0">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground">
                              <MoreHorizontal className="h-4 w-4 mr-2" />
                              Change Status
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleChangeStatus(company.slug, 'active')}>
                                Mark as Active
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleChangeStatus(company.slug, 'draft')}>
                                Mark as Draft
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleChangeStatus(company.slug, 'archived')}>
                                Mark as Archived
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDeleteCompany(company.id)}
                          disabled={deleteMutation.isPending}
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
