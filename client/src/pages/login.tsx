import { useLocation } from 'wouter';
import { LoginForm } from '@/components/LoginForm';
import { useAuth } from '@/lib/auth';
import { useEffect } from 'react';

export default function LoginPage() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        setLocation('/admin');
      } else if (user.role === 'recruiter' && user.companySlug) {
        setLocation(`/${user.companySlug}/edit`);
      } else {
        setLocation('/');
      }
    }
  }, [isAuthenticated, user, setLocation]);

  return <LoginForm />;
}
