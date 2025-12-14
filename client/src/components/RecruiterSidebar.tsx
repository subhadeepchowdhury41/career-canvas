import { Link, useLocation } from 'wouter';
import { Palette, LayoutList, Eye, Settings, LogOut, Share2, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/auth';
import { ThemeToggle } from './ThemeToggle';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface RecruiterSidebarProps {
  companyName: string;
  companySlug: string;
}

export function RecruiterSidebar({ companyName, companySlug }: RecruiterSidebarProps) {
  const [location] = useLocation();
  const { logout, user } = useAuth();

  // Fetch brand settings specifically for the logo
  const { data: brandSettings } = useQuery({
    queryKey: ['brand', companySlug],
    queryFn: async () => {
      const response = await api.get(`/companies/${companySlug}/brand`);
      return response.data.brandSettings;
    },
    enabled: !!companySlug,
  });

  const navItems = [
    { icon: Palette, label: 'Brand Settings', href: `/${companySlug}/edit` },
    { icon: LayoutList, label: 'Content Sections', href: `/${companySlug}/edit/sections` },
    { icon: Briefcase, label: 'Job Listings', href: `/${companySlug}/edit/jobs` },
    { icon: Eye, label: 'Preview', href: `/${companySlug}/preview` },
  ];

  const handleShareLink = () => {
    const url = `${window.location.origin}/${companySlug}/careers`;
    navigator.clipboard.writeText(url);
    console.log('Careers link copied:', url);
  };

  const logoUrl = brandSettings?.logoUrl;

  return (
    <div className="w-64 h-screen bg-sidebar border-r flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <div className="w-10 h-10 rounded-lg bg-white border flex items-center justify-center overflow-hidden p-1">
              <img src={logoUrl} alt={companyName} className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
              {companyName.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate" data-testid="text-company-name">{companyName}</p>
            <p className="text-xs text-muted-foreground">Recruiter Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href || 
              (item.href === `/${companySlug}/edit` && location === `/${companySlug}/edit`);
            return (
              <li key={item.href}>
                <Link href={item.href}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-2"
                    data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              </li>
            );
          })}
        </ul>

        <Separator className="my-4" />

        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={handleShareLink}
          data-testid="button-share-link"
        >
          <Share2 className="h-4 w-4" />
          Copy Careers Link
        </Button>
      </nav>

      <div className="p-4 border-t space-y-2">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-medium">
             {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || 'Recruiter'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
        <Separator />
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground"
          onClick={logout}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}
