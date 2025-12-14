import { AuthProvider } from '@/lib/auth';
import { LoginForm } from '../LoginForm';

export default function LoginFormExample() {
  return (
    <AuthProvider>
      <LoginForm onSuccess={() => console.log('Login successful')} />
    </AuthProvider>
  );
}
