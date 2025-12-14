import { BrandSettingsForm } from '../BrandSettingsForm';
import { mockBrandSettings } from '@/lib/mockData';

export default function BrandSettingsFormExample() {
  return (
    <div className="p-6 max-w-5xl">
      <BrandSettingsForm
        initialSettings={mockBrandSettings}
        onSave={(settings) => console.log('Saved:', settings)}
      />
    </div>
  );
}
