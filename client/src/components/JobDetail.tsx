import { ArrowLeft, MapPin, Briefcase, Banknote, Clock, Building2, Share2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Job } from './JobCard';

interface JobDetailProps {
  job: Job;
  companyName: string;
  companySlug: string;
  onBack?: () => void;
}

export function JobDetail({ job, companyName, companySlug, onBack }: JobDetailProps) {
  const handleShare = () => {
    const url = `${window.location.origin}/${companySlug}/careers/${job.jobSlug}`;
    if (navigator.share) {
      navigator.share({ title: job.title, url });
    } else {
      navigator.clipboard.writeText(url);
      console.log('Link copied to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b sticky top-0 bg-background z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Button variant="ghost" size="sm" onClick={onBack} data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <span className="text-muted-foreground hidden sm:inline">/</span>
            <span className="text-muted-foreground hidden sm:inline">{companyName}</span>
            <span className="text-muted-foreground hidden sm:inline">/</span>
            <span className="hidden sm:inline truncate max-w-[200px]">{job.title}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleShare} data-testid="button-share">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">{job.department}</Badge>
                <Badge variant="outline">{job.workPolicy}</Badge>
                <Badge variant="outline">{job.employmentType}</Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-job-title">
                {job.title}
              </h1>
              <div className="flex flex-wrap gap-4 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {companyName}
                </span>
              </div>
            </div>

            <Separator />

            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <h2>About the Role</h2>
              <div className="whitespace-pre-wrap">
                {job.description || (
                  <p>
                    We are looking for a talented {job.title} to join our {job.department} team. 
                    This is an exciting opportunity to work on cutting-edge projects and make a 
                    real impact on our products and customers.
                  </p>
                )}
              </div>

              {job.responsibilities && (
                <>
                  <h2>Responsibilities</h2>
                  <div className="whitespace-pre-wrap">{job.responsibilities}</div>
                </>
              )}

              {job.requirements && (
                <>
                  <h2>Requirements</h2>
                  <div className="whitespace-pre-wrap">{job.requirements}</div>
                </>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Job Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Banknote className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Salary</p>
                      <p className="font-medium">{job.salaryRange}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Briefcase className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Experience Level</p>
                      <p className="font-medium">{job.experienceLevel}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Posted</p>
                      <p className="font-medium">{job.postedDaysAgo}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Work Policy</p>
                      <p className="font-medium">{job.workPolicy}</p>
                    </div>
                  </div>

                  <Separator />

                  <Button className="w-full" data-testid="button-apply">
                    Apply Now
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    You will be redirected to the application form
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t lg:hidden">
        <Button className="w-full" data-testid="button-apply-mobile">
          Apply Now
          <ExternalLink className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
