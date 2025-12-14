import { Button } from '@/components/ui/button';
import { ChevronDown, Building2 } from 'lucide-react';
import { useState } from 'react';

interface CareersHeroProps {
  companyName: string;
  tagline: string;
  description: string;
  logoUrl?: string;
  bannerUrl?: string;
  primaryColor?: string;
  onViewPositions?: () => void;
}

export function CareersHero({ 
  companyName, 
  tagline, 
  description, 
  logoUrl, 
  bannerUrl,
  primaryColor,
  onViewPositions 
}: CareersHeroProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <section className="relative min-h-[70vh] md:min-h-screen flex items-center justify-center overflow-hidden">
      {bannerUrl && (
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bannerUrl})` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
      
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {logoUrl && !imageError ? (
          <img 
            src={logoUrl} 
            alt={`${companyName} logo`} 
            className="h-16 md:h-24 mx-auto mb-6 object-contain"
            onError={() => setImageError(true)}
            data-testid="img-company-logo"
          />
        ) : (
          <div className="h-16 md:h-24 w-16 md:w-24 mx-auto mb-6 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Building2 className="h-8 w-8 md:h-12 md:w-12 text-white" />
          </div>
        )}
        
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4" data-testid="text-hero-tagline">
          {tagline}
        </h1>
        
        <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto" data-testid="text-hero-description">
          {description}
        </p>
        
        <Button 
          size="lg" 
          onClick={onViewPositions}
          style={primaryColor ? { 
            backgroundColor: `${primaryColor}CC`, // 80% opacity
            borderColor: primaryColor,
          } : undefined}
          className={!primaryColor ? "bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30" : "text-white hover:opacity-90 transition-opacity backdrop-blur-sm border"}
          data-testid="button-view-positions"
        >
          View Open Positions
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="h-6 w-6 text-white/60" />
      </div>
    </section>
  );
}
