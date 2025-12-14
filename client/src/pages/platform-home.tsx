import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Building2, Search, Briefcase, MapPin, ArrowRight, Loader2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { ThemeToggle } from '@/components/ThemeToggle';
import api from '@/lib/api';

import { SEO } from '@/components/SEO';

interface Company {
  id: string;
  name: string;
  slug: string;
  status: string;
  recruiterCount: number;
}

interface Job {
  id: string;
  title: string;
  companyId: string;
  location: string;
  jobType: string;
  employmentType: string;
  postedDaysAgo: string;
  company?: Company;
  jobSlug: string;
}

export default function PlatformLandingPage() {
  const [search, setSearch] = useState('');
  const { user, logout } = useAuth();

  const { data: companies, isLoading } = useQuery({
    queryKey: ['platform-companies'],
    queryFn: async () => {
      const response = await api.get('/companies');
      return response.data.companies as Company[];
    },
  });

  const { data: jobs, isLoading: isLoadingJobs } = useQuery({
    queryKey: ['platform-jobs'],
    queryFn: async () => {
      const response = await api.get('/jobs');
      return response.data.jobs as Job[];
    },
  });

  const activeCompanies = companies?.filter(c => c.status === 'active') || [];
  
  const filteredCompanies = activeCompanies.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Career Canvas - Find Your Next Chapter"
        description="Explore career opportunities from top companies building the future. Find your next role today."
      />

      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Career Canvas Logo" className="w-8 h-8 rounded-sm object-contain" />
            <span className="font-bold text-xl hidden sm:inline-block">Career Canvas</span>
          </div>

          <div className="flex items-center gap-4">
             <ThemeToggle />
             {user ? (
               <div className="flex items-center gap-4">
                 <span className="text-sm font-medium hidden sm:inline-block">
                   Welcome, {user.name}
                 </span>
                 {user.role === 'admin' && (
                   <Link href="/admin">
                     <Button variant="outline" size="sm">Admin Dashboard</Button>
                   </Link>
                 )}
                 {user.role === 'recruiter' && (
                   <Link href={`/${user.companySlug || 'acme-corp'}/edit`}>
                     <Button variant="outline" size="sm">Recruiter Dashboard</Button>
                   </Link>
                 )}
                 <Button variant="ghost" size="sm" onClick={() => logout()}>
                   <LogOut className="h-4 w-4 mr-2" />
                   Sign Out
                 </Button>
               </div>
             ) : (
               <div className="flex items-center gap-2">
                 <Link href="/login">
                   <Button variant="ghost" size="sm">Log In</Button>
                 </Link>
                 <Link href="/signup">
                   <Button size="sm">Sign Up</Button>
                 </Link>
               </div>
             )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
              Find Your Next Chapter
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore career opportunities from top companies building the future.
            </p>
            
            <div className="relative max-w-lg mx-auto mt-8">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                className="pl-10 h-12 text-lg" 
                placeholder="Search companies..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

           <div>
             <div className="flex items-center justify-between mb-6">
               <h2 className="text-2xl font-bold tracking-tight">Active Companies</h2>
               <Badge variant="outline">{filteredCompanies.length} Found</Badge>
             </div>

             {isLoading ? (
               <div className="flex justify-center py-12">
                 <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
               </div>
             ) : filteredCompanies.length === 0 ? (
               <div className="text-center py-12 border rounded-lg bg-muted/20">
                 <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                 <h3 className="text-lg font-medium">No companies found</h3>
                 <p className="text-muted-foreground">Try adjusting your search terms</p>
               </div>
             ) : (
               <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                 {filteredCompanies.map((company) => (
                   <Link key={company.id} href={`/${company.slug}/careers`}>
                     <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                       <CardHeader>
                         <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                           <Building2 className="h-6 w-6 text-primary" />
                         </div>
                         <CardTitle>{company.name}</CardTitle>
                         <CardDescription>/{company.slug}</CardDescription>
                       </CardHeader>
                       <CardContent>
                         <p className="text-sm text-muted-foreground">
                           View career opportunities and open positions at {company.name}.
                         </p>
                       </CardContent>
                       <CardFooter>
                         <div className="text-sm font-medium text-primary flex items-center">
                           View Careers <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                         </div>
                       </CardFooter>
                     </Card>
                   </Link>
                 ))}
               </div>
             )}
          </div>

          <div>
             <div className="flex items-center justify-between mb-6">
               <h2 className="text-2xl font-bold tracking-tight">Recent Jobs</h2>
               <Badge variant="outline">{jobs?.length || 0} Open</Badge>
             </div>

             {isLoadingJobs ? (
               <div className="flex justify-center py-12">
                 <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
               </div>
             ) : jobs?.length === 0 ? (
               <div className="text-center py-12 border rounded-lg bg-muted/20">
                 <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                 <h3 className="text-lg font-medium">No active jobs found</h3>
                 <p className="text-muted-foreground">Check back later for new opportunities.</p>
               </div>
             ) : (
               <div className="grid gap-4 md:grid-cols-2">
                 {jobs?.map((job) => (
                   <Link key={job.id} href={`/${job.company?.slug}/careers/${job.jobSlug}`}>
                     <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                       <CardHeader className="pb-3">
                         <div className="flex justify-between items-start">
                           <div>
                             <CardTitle className="text-lg font-semibold">{job.title}</CardTitle>
                             <CardDescription className="flex items-center mt-1">
                               <Building2 className="h-3 w-3 mr-1" /> {job.company?.name}
                             </CardDescription>
                           </div>
                           <Badge variant={job.jobType === 'Permanent' ? 'default' : 'secondary'}>
                             {job.jobType}
                           </Badge>
                         </div>
                       </CardHeader>
                       <CardContent>
                         <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-3">
                           <div className="flex items-center bg-muted px-2 py-1 rounded">
                             <MapPin className="h-3 w-3 mr-1" />
                             {job.location}
                           </div>
                           <div className="flex items-center bg-muted px-2 py-1 rounded">
                             <Briefcase className="h-3 w-3 mr-1" />
                             {job.employmentType}
                           </div>
                         </div>
                       </CardContent>
                       <CardFooter className="pt-0 flex justify-between items-center text-sm text-muted-foreground">
                         <span>{job.postedDaysAgo}</span>
                         <span className="text-primary flex items-center font-medium">
                           Apply Now <ArrowRight className="ml-1 h-3 w-3" />
                         </span>
                       </CardFooter>
                     </Card>
                   </Link>
                 ))}
               </div>
             )}
          </div>

        </div>
      </main>
      
      <footer className="border-t py-8 mt-12 bg-muted/20">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Career Canvas. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
