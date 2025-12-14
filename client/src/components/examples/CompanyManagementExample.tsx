import { CompanyManagement } from '../CompanyManagement';
import { mockCompanies } from '@/lib/mockData';

export default function CompanyManagementExample() {
  return (
    <div className="p-6">
      <CompanyManagement
        initialCompanies={mockCompanies}
        onCreateCompany={(company) => console.log('Create:', company)}
        onDeleteCompany={(id) => console.log('Delete:', id)}
        onViewCompany={(slug) => console.log('View:', slug)}
      />
    </div>
  );
}
