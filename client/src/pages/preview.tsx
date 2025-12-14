import { useParams, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Monitor, Tablet, Smartphone, Check, X, Building2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

export default function PreviewPage() {
  const params = useParams<{ companySlug: string }>();
  const [, setLocation] = useLocation();
  const companySlug = params.companySlug || 'acme-corp';
  const companyName = companySlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [isPublishing, setIsPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  const viewportWidths: Record<ViewportSize, string> = {
    desktop: 'w-full',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]',
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsPublishing(false);
    setPublished(true);
    setTimeout(() => setPublished(false), 3000);
  };

  const handleDiscard = () => {
    setLocation(`/${companySlug}/edit`);
  };

  const handleExit = () => {
    setLocation(`/${companySlug}/edit`);
  };

  return (
    <div className="h-screen flex flex-col bg-muted/30">
      <header className="bg-background border-b px-4 py-3 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleExit} data-testid="button-exit-preview">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Exit Preview
          </Button>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-primary/10">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <span className="font-medium">{companyName}</span>
          </div>
          <Badge variant="secondary">Preview Mode</Badge>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <Button
              variant={viewport === 'desktop' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewport('desktop')}
              data-testid="button-viewport-desktop"
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant={viewport === 'tablet' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewport('tablet')}
              data-testid="button-viewport-tablet"
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              variant={viewport === 'mobile' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewport('mobile')}
              data-testid="button-viewport-mobile"
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleDiscard} data-testid="button-discard">
            <X className="h-4 w-4 mr-2" />
            Discard
          </Button>
          <Button onClick={handlePublish} disabled={isPublishing} data-testid="button-publish">
            {published ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Published
              </>
            ) : isPublishing ? (
              'Publishing...'
            ) : (
              'Publish Changes'
            )}
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 flex justify-center">
        <div 
          className={cn(
            "bg-background rounded-lg shadow-lg overflow-hidden transition-all duration-300",
            viewportWidths[viewport],
            viewport !== 'desktop' && 'max-h-[calc(100vh-120px)]'
          )}
        >
          <iframe
            src={`/${companySlug}/careers`}
            className="w-full h-full min-h-[calc(100vh-120px)]"
            title="Careers Page Preview"
          />
        </div>
      </div>
    </div>
  );
}
