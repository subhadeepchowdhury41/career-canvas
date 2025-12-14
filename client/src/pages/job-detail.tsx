import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { useParams, useLocation } from 'wouter';
import { JobDetail } from '@/components/JobDetail';
import { SEO } from '@/components/SEO';
import { useEffect } from 'react';

export default function JobDetailPage() {
  const params = useParams<{ companySlug: string; jobSlug: string }>();
  const [, setLocation] = useLocation();
  
  const companySlug = params.companySlug || 'acme-corp';
  const jobSlug = params.jobSlug || '';
  
  // Fetch job details
  const { data: job, isLoading } = useQuery({
    queryKey: ['job', companySlug, jobSlug],
    queryFn: async () => {
      const response = await api.get(`/companies/${companySlug}/jobs/${jobSlug}`);
      return response.data.job;
    },
    enabled: !!jobSlug,
  });

  const companyName = companySlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  // Structured Data for Job Posting
  const structuredData = job ? {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description || `${job.title} position at ${companyName}`,
    datePosted: job.postedAt,
    employmentType: job.employmentType?.toUpperCase().replace(' ', '_'),
    hiringOrganization: {
      '@type': 'Organization',
      name: companyName,
    },
    jobLocation: {
      '@type': 'Place',
      address: job.location,
    },
    baseSalary: {
      '@type': 'MonetaryAmount',
      value: {
        '@type': 'QuantitativeValue',
        value: job.salaryRange,
      },
    },
  } : undefined;

  const handleBack = () => {
    setLocation(`/${companySlug}/careers`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Job not found</h1>
          <p className="text-muted-foreground mb-4">The position you're looking for doesn't exist.</p>
          <button onClick={handleBack} className="text-primary underline">
            Back to careers
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {job && (
        <SEO
          title={`${job.title} at ${companyName} | Careers`}
          description={`${job.title} - ${job.location}. ${job.salaryRange || ''}`}
          structuredData={structuredData}
          type="article" 
        />
      )}
      <JobDetail
        job={job}
        companyName={companyName}
        companySlug={companySlug}
        onBack={handleBack}
      />
    </>
  );
}
