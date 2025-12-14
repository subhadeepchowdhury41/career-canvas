import { Card, CardContent } from '@/components/ui/card';
import { Heart, Users, Zap, Globe, Coffee, Rocket, Shield, Star } from 'lucide-react';

export type SectionType = 'about' | 'culture' | 'benefits' | 'values' | 'team' | 'video';

interface ContentSectionProps {
  type: SectionType;
  title: string;
  content: string;
  items?: Array<{ icon?: string; title: string; description: string }>;
  imageUrl?: string;
  videoUrl?: string;
}

const iconMap: Record<string, typeof Heart> = {
  heart: Heart,
  users: Users,
  zap: Zap,
  globe: Globe,
  coffee: Coffee,
  rocket: Rocket,
  shield: Shield,
  star: Star,
};

export function ContentSection({ type, title, content, items, imageUrl, videoUrl }: ContentSectionProps) {
  if (type === 'video') {
    const src = videoUrl || content;
    const isDirectFile = src.match(/\.(mp4|webm|ogg)$/i);
    
    // Helper to format embed URLs for autoplay
    const getEmbedUrl = (url: string) => {
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
        if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=0&loop=1&playlist=${videoId}`;
      }
      if (url.includes('vimeo.com')) {
        const videoId = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/)?.[1];
        if (videoId) return `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=0&background=1`;
      }
      return url;
    };

    return (
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid={`text-section-${type}`}>
            {title}
          </h2>
          {/* Only show content text if it's NOT a URL (fallback description) */}
          {!content.startsWith('http') && (
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">{content}</p>
          )}
          
          <div className="aspect-video rounded-xl overflow-hidden bg-black shadow-xl relative">
            {isDirectFile ? (
              <video
                src={src}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                controls
              />
            ) : (
              <iframe
                src={getEmbedUrl(src)}
                title={title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </div>
      </section>
    );
  }

  if (type === 'about') {
    return (
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid={`text-section-${type}`}>
                {title}
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">{content}</p>
            </div>
            {imageUrl && (
              <div className="rounded-lg overflow-hidden">
                <img src={imageUrl} alt={title} className="w-full h-64 md:h-80 object-cover" />
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (type === 'benefits' || type === 'values') {
    return (
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center" data-testid={`text-section-${type}`}>
            {title}
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">{content}</p>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {items?.map((item, index) => {
              const IconComponent = item.icon ? iconMap[item.icon] || Star : Star;
              return (
                <Card key={index}>
                  <CardContent className="pt-6 text-center">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  if (type === 'culture' || type === 'team') {
    return (
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center" data-testid={`text-section-${type}`}>
            {title}
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">{content}</p>
          
          <div className="grid sm:grid-cols-3 gap-6">
            {items?.map((item, index) => {
              const IconComponent = item.icon ? iconMap[item.icon] || Zap : Zap;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
        <p className="text-muted-foreground text-lg">{content}</p>
      </div>
    </section>
  );
}
