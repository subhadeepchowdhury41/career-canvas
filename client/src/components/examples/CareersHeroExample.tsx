import { CareersHero } from '../CareersHero';
import bannerImage from '@assets/stock_images/modern_corporate_off_659946fc.jpg';

export default function CareersHeroExample() {
  return (
    <CareersHero
      companyName="Acme Corp"
      tagline="Join Our Team"
      description="We're building the future of work. Join us on our mission to transform how teams collaborate and succeed together."
      bannerUrl={bannerImage}
      onViewPositions={() => console.log('Scroll to positions')}
    />
  );
}
