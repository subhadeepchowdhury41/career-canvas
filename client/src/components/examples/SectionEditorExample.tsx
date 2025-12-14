import { SectionEditor } from '../SectionEditor';
import { mockSections } from '@/lib/mockData';

export default function SectionEditorExample() {
  return (
    <div className="p-6 max-w-4xl">
      <SectionEditor
        initialSections={mockSections}
        onSave={(sections) => console.log('Saved sections:', sections)}
      />
    </div>
  );
}
