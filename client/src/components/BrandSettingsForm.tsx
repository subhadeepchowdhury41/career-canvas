import { useState, useEffect } from 'react';
import { Upload, Link as LinkIcon, Save, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'wouter';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface BrandSettings {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  bannerUrl: string;
  cultureVideoUrl: string;
  tagline: string;
  description: string;
}

const defaultSettings: BrandSettings = {
  primaryColor: '#000000',
  secondaryColor: '#ffffff',
  logoUrl: '',
  bannerUrl: '',
  cultureVideoUrl: '',
  tagline: '',
  description: '',
};

export function BrandSettingsForm() {
  const params = useParams<{ companySlug: string }>();
  const companySlug = params.companySlug || 'acme-corp'; // Fallback for dev/testing
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [settings, setSettings] = useState<BrandSettings>(defaultSettings);
  const [saved, setSaved] = useState(false);

  // Fetch brand settings
  const { data, isLoading } = useQuery({
    queryKey: ['brand', companySlug],
    queryFn: async () => {
      const response = await api.get(`/companies/${companySlug}/brand`);
      return response.data.brandSettings as BrandSettings;
    },
  });

  // Update local state when data is loaded
  useEffect(() => {
    if (data) {
      setSettings(data);
    }
  }, [data]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (newSettings: BrandSettings) => {
      const response = await api.put(`/companies/${companySlug}/brand`, newSettings);
      return response.data.brandSettings;
    },
    onSuccess: (savedData) => {
      setSettings(savedData);
      queryClient.setQueryData(['brand', companySlug], savedData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      toast({
        title: 'Success',
        description: 'Brand settings saved successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save settings',
        variant: 'destructive',
      });
    },
  });

  const updateSetting = <K extends keyof BrandSettings>(key: K, value: BrandSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    saveMutation.mutate(settings);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, key: keyof BrandSettings) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) { // 50MB check
        toast({
          title: 'File too large',
          description: 'Please upload an image smaller than 50MB',
          variant: 'destructive',
        });
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await api.post('/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.url) {
          updateSetting(key, response.data.url);
          toast({
            title: 'Upload Successful',
            description: 'Image uploaded successfully',
          });
        }
      } catch (error: any) {
        console.error('Upload failed:', error);
         toast({
          title: 'Upload Failed',
          description: error.response?.data?.message || 'Failed to upload image',
          variant: 'destructive',
        });
      }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Brand Settings</h1>
          <p className="text-muted-foreground">Customize your careers page appearance</p>
        </div>
        <Button onClick={handleSave} disabled={saveMutation.isPending} data-testid="button-save-brand">
          {saved ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Saved
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Colors</CardTitle>
            <CardDescription>Set your brand colors for the careers page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  id="primaryColor"
                  value={settings.primaryColor}
                  onChange={(e) => updateSetting('primaryColor', e.target.value)}
                  className="w-16 h-10 p-1 cursor-pointer"
                  data-testid="input-primary-color"
                />
                <Input
                  type="text"
                  value={settings.primaryColor}
                  onChange={(e) => updateSetting('primaryColor', e.target.value)}
                  className="flex-1 font-mono"
                  placeholder="#000000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  id="secondaryColor"
                  value={settings.secondaryColor}
                  onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                  className="w-16 h-10 p-1 cursor-pointer"
                  data-testid="input-secondary-color"
                />
                <Input
                  type="text"
                  value={settings.secondaryColor}
                  onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                  className="flex-1 font-mono"
                  placeholder="#000000"
                />
              </div>
            </div>
            <div className="p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground mb-2">Preview</p>
              <div className="flex gap-2">
                <div 
                  className="w-12 h-12 rounded-lg" 
                  style={{ backgroundColor: settings.primaryColor }}
                />
                <div 
                  className="w-12 h-12 rounded-lg" 
                  style={{ backgroundColor: settings.secondaryColor }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hero Content</CardTitle>
            <CardDescription>Headline and description for your careers page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={settings.tagline}
                onChange={(e) => updateSetting('tagline', e.target.value)}
                placeholder="Join Our Team"
                data-testid="input-tagline"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={settings.description}
                onChange={(e) => updateSetting('description', e.target.value)}
                placeholder="Tell candidates about your company mission..."
                rows={4}
                data-testid="input-description"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logo</CardTitle>
            <CardDescription>Your company logo for the careers page header</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <div className="flex gap-2">
                <Input
                  id="logoUrl"
                  type="url"
                  value={settings.logoUrl}
                  onChange={(e) => updateSetting('logoUrl', e.target.value)}
                  placeholder="https://example.com/logo.png"
                  data-testid="input-logo-url"
                />
                <div className="relative">
                  <Input
                    type="file"
                    id="logo-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'logoUrl')}
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    data-testid="button-upload-logo"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            {settings.logoUrl && (
              <div className="p-4 rounded-lg border bg-muted/30">
                <img 
                  src={settings.logoUrl} 
                  alt="Logo preview" 
                  className="max-h-16 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Banner Image</CardTitle>
            <CardDescription>Hero background image (recommended: 1920x1080)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bannerUrl">Banner URL</Label>
              <div className="flex gap-2">
                <Input
                  id="bannerUrl"
                  type="url"
                  value={settings.bannerUrl}
                  onChange={(e) => updateSetting('bannerUrl', e.target.value)}
                  placeholder="https://example.com/banner.jpg"
                  data-testid="input-banner-url"
                />
                <div className="relative">
                  <Input
                    type="file"
                    id="banner-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'bannerUrl')}
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    data-testid="button-upload-banner"
                    onClick={() => document.getElementById('banner-upload')?.click()}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            {settings.bannerUrl && (
              <div className="aspect-video rounded-lg border overflow-hidden bg-muted/30">
                <img 
                  src={settings.bannerUrl} 
                  alt="Banner preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Culture Video</CardTitle>
            <CardDescription>Embed a YouTube or Vimeo video to showcase your culture</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="videoUrl">Video Embed URL</Label>
              <div className="flex gap-2">
                <Input
                  id="videoUrl"
                  type="url"
                  value={settings.cultureVideoUrl}
                  onChange={(e) => updateSetting('cultureVideoUrl', e.target.value)}
                  placeholder="https://www.youtube.com/embed/..."
                  data-testid="input-video-url"
                />
                <Button variant="outline" size="icon">
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Use the embed URL format (e.g., youtube.com/embed/VIDEO_ID)
              </p>
            </div>
            {settings.cultureVideoUrl && (
              <div className="aspect-video rounded-lg border overflow-hidden bg-muted/30 max-w-2xl">
                <iframe
                  src={settings.cultureVideoUrl}
                  title="Culture video preview"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
