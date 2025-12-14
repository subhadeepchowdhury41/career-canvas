import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api, { setAccessToken } from './api';

export type UserRole = 'admin' | 'recruiter' | 'candidate';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId?: string;
  username: string;
  companySlug?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      // Try to refresh token first to get a new access token
      const refreshResponse = await api.post('/auth/refresh', {}, { 
        // Don't retry on 401 for this request
        headers: { 'X-Skip-Interceptor': 'true' }
      });
      
      if (refreshResponse.data.accessToken) {
        setAccessToken(refreshResponse.data.accessToken);
        setUser(refreshResponse.data.user);
      }
    } catch (error) {
      // No valid refresh token, user needs to log in
      setUser(null);
      setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await api.post('/auth/login', { email, password });
      
      const { user: userData, accessToken } = response.data;
      
      // Store access token in memory
      setAccessToken(accessToken);
      
      // Set user data
      setUser(userData);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
