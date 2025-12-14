import { SiLinkedin, SiX, SiFacebook, SiInstagram } from 'react-icons/si';
import { Building2 } from 'lucide-react';
import { useState } from 'react';

interface CareersFooterProps {
  companyName: string;
  logoUrl?: string;
  description?: string;
}

export function CareersFooter({ companyName, logoUrl, description }: CareersFooterProps) {
  const [imageError, setImageError] = useState(false);
  return (
    <footer className="bg-muted/50 border-t">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              {logoUrl && !imageError ? (
                <img 
                  src={logoUrl} 
                  alt={companyName} 
                  className="h-8 object-contain"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                  <Building2 className="h-5 w-5" />
                </div>
              )}
              <span className="font-semibold text-lg">{companyName}</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-md">
              {description || `Join ${companyName} and be part of something great. We're always looking for talented individuals to join our team.`}
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#open-positions" className="text-muted-foreground hover:text-foreground transition-colors">
                  Open Positions
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Connect With Us</h3>
            <div className="flex gap-3">
              <a 
                href="#" 
                className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                aria-label="LinkedIn"
              >
                <SiLinkedin className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                aria-label="X (Twitter)"
              >
                <SiX className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                aria-label="Facebook"
              >
                <SiFacebook className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                aria-label="Instagram"
              >
                <SiInstagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {companyName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
