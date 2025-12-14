import { AuthProvider } from '@/lib/auth';
import { ThemeProvider } from '@/lib/theme';
import { RecruiterSidebar } from '../RecruiterSidebar';

export default function RecruiterSidebarExample() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <div className="h-[600px]">
          <RecruiterSidebar companyName="Acme Corp" companySlug="acme-corp" />
        </div>
      </ThemeProvider>
    </AuthProvider>
  );
}
