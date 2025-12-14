import { AdminSidebar } from '@/components/AdminSidebar';
import { CompanyManagement } from '@/components/CompanyManagement';
import { UserManagement } from '@/components/UserManagement';
import { useParams } from 'wouter';

export default function AdminPage() {
  const params = useParams<{ section?: string }>();
  const section = params.section || 'dashboard';

  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-6">
        {section === 'users' ? (
          <UserManagement />
        ) : (
          <CompanyManagement />
        )}
      </main>
    </div>
  );
}
