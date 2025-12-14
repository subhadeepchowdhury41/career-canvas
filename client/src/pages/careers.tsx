import { useParams, useLocation } from 'wouter';
import { SEO } from '@/components/SEO';
import { CareersHero } from '@/components/CareersHero';
import { ContentSection } from '@/components/ContentSection';
import { JobListings } from '@/components/JobListings';
import { CareersFooter } from '@/components/CareersFooter';
import bannerImage from '@assets/stock_images/modern_corporate_off_659946fc.jpg';
import teamImage from '@assets/stock_images/happy_diverse_team_m_3b6a890d.jpg';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function CareersPage() {
  const params = useParams<{ companySlug: string }>();
  const [, setLocation] = useLocation();
  const companySlug = params.companySlug || 'acme-corp';
  
  // Fetch company details
  const { data: company, isLoading: isLoadingCompany } = useQuery({
    queryKey: ['company', companySlug],
    queryFn: async () => {
      const response = await api.get(`/companies/${companySlug}`);
      return response.data.company;
    },
  });

  // Fetch brand settings
  const { data: brandSettings } = useQuery({
    queryKey: ['brand', companySlug],
    queryFn: async () => {
      const response = await api.get(`/companies/${companySlug}/brand`);
      return response.data.brandSettings;
    },
  });

  // Fetch content sections
  const { data: sections } = useQuery({
    queryKey: ['sections', companySlug],
    queryFn: async () => {
      const response = await api.get(`/companies/${companySlug}/sections`);
      return response.data.sections;
    },
  });

  // Fetch jobs
  const { data: jobs } = useQuery({
    queryKey: ['jobs', companySlug],
    queryFn: async () => {
      const response = await api.get(`/companies/${companySlug}/jobs`);
      return response.data.jobs;
    },
  });

  const companyName = company?.name || companySlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const tagline = brandSettings?.tagline || 'Join Our Team';
  const description = brandSettings?.description || `Explore career opportunities at ${companyName}.`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: companyName,
    url: window.location.origin,
    description: description,
    logo: brandSettings?.logoUrl,
  };

  const handleViewJob = (jobSlug: string) => {
    setLocation(`/${companySlug}/careers/${jobSlug}`);
  };

  const scrollToPositions = () => {
    document.getElementById('open-positions')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (isLoadingCompany) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SEO 
        title={`${companyName} Careers - Join Our Team`}
        description={description}
        image={brandSettings?.bannerUrl}
        type="organization"
        structuredData={structuredData}
      />
      <a href="#open-positions" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded">
        Skip to job listings
      </a>
      
      <CareersHero
        companyName={companyName}
        tagline={tagline}
        description={description}
        bannerUrl={brandSettings?.bannerUrl || bannerImage}
        logoUrl={brandSettings?.logoUrl}
        primaryColor={brandSettings?.primaryColor}
        onViewPositions={scrollToPositions}
      />

      {sections?.length > 0 && sections
        .sort((a: any, b: any) => a.order - b.order)
        .map((section: any) => (
          <ContentSection
            key={section.id}
            type={section.type}
            title={section.title}
            content={section.content}
            items={section.items}
            imageUrl={section.type === 'about' ? teamImage : undefined}
          />
        ))}

      <JobListings
        jobs={jobs || []}
        companySlug={companySlug}
        onViewJob={handleViewJob}
      />

      <CareersFooter
        companyName={companyName}
        description={description}
      />
    </div>
  );
}
