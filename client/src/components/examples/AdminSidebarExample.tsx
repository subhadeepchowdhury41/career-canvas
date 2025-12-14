import { AuthProvider } from '@/lib/auth';
import { ThemeProvider } from '@/lib/theme';
import { AdminSidebar } from '../AdminSidebar';

export default function AdminSidebarExample() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <div className="h-[600px]">
          <AdminSidebar />
        </div>
      </ThemeProvider>
    </AuthProvider>
  );
}
