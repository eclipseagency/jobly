'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'employee' | 'employer';
  // Employer-specific
  tenantId?: string;
  tenantName?: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: 'employee' | 'employer') => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  getDashboardPath: () => string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'employee' | 'employer';
  companyName?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('jobly_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.id && parsed.email && parsed.role) {
          setUser(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
      localStorage.removeItem('jobly_user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string, role: 'employee' | 'employer'): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      const userData: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name || email.split('@')[0],
        avatar: data.user.avatar,
        role: data.user.role === 'employer' ? 'employer' : 'employee',
        tenantId: data.user.tenantId,
        tenantName: data.user.tenantName,
      };

      setUser(userData);
      localStorage.setItem('jobly_user', JSON.stringify(userData));

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Registration failed' };
      }

      const userData: User = {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name || data.email.split('@')[0],
        avatar: result.user.avatar,
        role: result.user.role === 'employer' ? 'employer' : 'employee',
        tenantId: result.user.tenantId,
        tenantName: result.user.tenantName,
      };

      setUser(userData);
      localStorage.setItem('jobly_user', JSON.stringify(userData));

      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('jobly_user');
    router.push('/');
  }, [router]);

  const getDashboardPath = useCallback(() => {
    if (user?.role === 'employer') {
      return '/employer/dashboard';
    } else if (user?.role === 'employee') {
      return '/dashboard';
    }
    return '/auth';
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: user !== null,
      isLoading,
      login,
      register,
      logout,
      getDashboardPath
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook to protect routes - redirects to login if not authenticated
export function useRequireAuth(requiredRole?: 'employee' | 'employer') {
  const { user, isLoading, isLoggedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn) {
        // Redirect to login with return URL
        const loginPath = requiredRole === 'employer'
          ? `/auth/employer/login?redirect=${encodeURIComponent(pathname)}`
          : `/auth/employee/login?redirect=${encodeURIComponent(pathname)}`;
        router.replace(loginPath);
      } else if (requiredRole && user?.role !== requiredRole) {
        // User is logged in but with wrong role
        router.replace(user?.role === 'employer' ? '/employer/dashboard' : '/dashboard');
      }
    }
  }, [isLoading, isLoggedIn, user, requiredRole, router, pathname]);

  return { user, isLoading, isAuthenticated: isLoggedIn && (!requiredRole || user?.role === requiredRole) };
}
