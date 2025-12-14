import { Switch, Route, useLocation } from 'wouter';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider, useAuth } from '@/lib/auth';
import { ThemeProvider } from '@/lib/theme';
import NotFound from '@/pages/not-found';
import LoginPage from '@/pages/login';
import AdminPage from '@/pages/admin';
import RecruiterDashboard from '@/pages/recruiter-dashboard';
import CareersPage from '@/pages/careers';
import JobDetailPage from '@/pages/job-detail';
import PreviewPage from '@/pages/preview';
import SignupPage from '@/pages/signup';
import PlatformLandingPage from '@/pages/platform-home';
import { useEffect } from 'react';

function ProtectedRoute({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode; 
  allowedRoles: string[] 
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/login');
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don&apos;t have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      
      <Route path="/admin">
        {() => (
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminPage />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/:section">
        {() => (
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminPage />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/:companySlug/edit">
        {() => (
          <ProtectedRoute allowedRoles={['admin', 'recruiter']}>
            <RecruiterDashboard />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/:companySlug/edit/:tab">
        {() => (
          <ProtectedRoute allowedRoles={['admin', 'recruiter']}>
            <RecruiterDashboard />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/:companySlug/preview">
        {() => (
          <ProtectedRoute allowedRoles={['admin', 'recruiter']}>
            <PreviewPage />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/:companySlug/careers/:jobSlug" component={JobDetailPage} />
      <Route path="/:companySlug/careers" component={CareersPage} />
      
      <Route path="/:companySlug/careers/:jobSlug" component={JobDetailPage} />
      <Route path="/:companySlug/careers" component={CareersPage} />
      
      <Route path="/signup" component={SignupPage} />
      <Route path="/" component={PlatformLandingPage} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
