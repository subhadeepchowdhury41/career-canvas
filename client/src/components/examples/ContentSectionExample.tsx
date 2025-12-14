import { ContentSection } from '../ContentSection';
import teamImage from '@assets/stock_images/happy_diverse_team_m_3b6a890d.jpg';

const benefitsItems = [
  { icon: 'heart', title: 'Health Insurance', description: 'Comprehensive medical, dental, and vision coverage' },
  { icon: 'coffee', title: 'Flexible Hours', description: 'Work when you\'re most productive' },
  { icon: 'globe', title: 'Remote First', description: 'Work from anywhere in the world' },
  { icon: 'rocket', title: 'Learning Budget', description: '$2,000 annual learning and development' },
];

export default function ContentSectionExample() {
  return (
    <div className="space-y-0">
      <ContentSection
        type="about"
        title="About Us"
        content="We're a team of passionate individuals dedicated to building products that make a difference. Founded in 2020, we've grown from a small startup to a global team of 200+ employees across 15 countries."
        imageUrl={teamImage}
      />
      <ContentSection
        type="benefits"
        title="Why Join Us?"
        content="We believe in taking care of our team with competitive benefits and a supportive culture."
        items={benefitsItems}
      />
    </div>
  );
}
