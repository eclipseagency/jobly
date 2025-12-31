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

interface StoredUser extends User {
  passwordHash: string;
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

// Simple hash function for localStorage-only mode (not cryptographically secure - just for demo)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

// Generate a simple unique ID
function generateId(): string {
  return 'local_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Get stored users from localStorage
function getStoredUsers(): StoredUser[] {
  try {
    const stored = localStorage.getItem('jobly_users_db');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save users to localStorage
function saveStoredUsers(users: StoredUser[]): void {
  localStorage.setItem('jobly_users_db', JSON.stringify(users));
}

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
      // Try API first
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (response.ok && data.user) {
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
      }

      // If API fails with specific error, return it
      if (data.error && !data.error.includes('error occurred')) {
        return { success: false, error: data.error };
      }

      // Fallback to localStorage-based auth
      console.log('Using localStorage fallback for login');
      const users = getStoredUsers();
      const storedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!storedUser) {
        return { success: false, error: 'No account found with this email' };
      }

      if (storedUser.passwordHash !== simpleHash(password)) {
        return { success: false, error: 'Invalid password' };
      }

      if (storedUser.role !== role) {
        return { success: false, error: `This account is registered as ${storedUser.role === 'employer' ? 'an employer' : 'a job seeker'}` };
      }

      const userData: User = {
        id: storedUser.id,
        email: storedUser.email,
        name: storedUser.name,
        avatar: storedUser.avatar,
        role: storedUser.role,
        tenantId: storedUser.tenantId,
        tenantName: storedUser.tenantName,
      };

      setUser(userData);
      localStorage.setItem('jobly_user', JSON.stringify(userData));
      return { success: true };

    } catch (error) {
      console.error('Login error:', error);

      // Fallback to localStorage on network error
      const users = getStoredUsers();
      const storedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!storedUser) {
        return { success: false, error: 'No account found with this email' };
      }

      if (storedUser.passwordHash !== simpleHash(password)) {
        return { success: false, error: 'Invalid password' };
      }

      if (storedUser.role !== role) {
        return { success: false, error: `This account is registered as ${storedUser.role === 'employer' ? 'an employer' : 'a job seeker'}` };
      }

      const userData: User = {
        id: storedUser.id,
        email: storedUser.email,
        name: storedUser.name,
        avatar: storedUser.avatar,
        role: storedUser.role,
        tenantId: storedUser.tenantId,
        tenantName: storedUser.tenantName,
      };

      setUser(userData);
      localStorage.setItem('jobly_user', JSON.stringify(userData));
      return { success: true };
    }
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      // Try API first
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.user) {
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
      }

      // If API fails with specific validation error, return it
      if (result.error && !result.error.includes('error occurred')) {
        return { success: false, error: result.error };
      }

      // Fallback to localStorage-based registration
      console.log('Using localStorage fallback for registration');

      // Validate
      if (!data.email || !data.password || !data.name) {
        return { success: false, error: 'Email, password, and name are required' };
      }

      if (data.password.length < 8) {
        return { success: false, error: 'Password must be at least 8 characters' };
      }

      if (data.role === 'employer' && !data.companyName) {
        return { success: false, error: 'Company name is required for employer accounts' };
      }

      const users = getStoredUsers();

      // Check if email exists
      if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
        return { success: false, error: 'An account with this email already exists' };
      }

      const newUser: StoredUser = {
        id: generateId(),
        email: data.email.toLowerCase(),
        name: data.name,
        role: data.role,
        passwordHash: simpleHash(data.password),
        tenantId: data.role === 'employer' ? generateId() : undefined,
        tenantName: data.companyName,
      };

      users.push(newUser);
      saveStoredUsers(users);

      const userData: User = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        tenantId: newUser.tenantId,
        tenantName: newUser.tenantName,
      };

      setUser(userData);
      localStorage.setItem('jobly_user', JSON.stringify(userData));
      return { success: true };

    } catch (error) {
      console.error('Register error:', error);

      // Fallback to localStorage on network error
      if (!data.email || !data.password || !data.name) {
        return { success: false, error: 'Email, password, and name are required' };
      }

      if (data.password.length < 8) {
        return { success: false, error: 'Password must be at least 8 characters' };
      }

      if (data.role === 'employer' && !data.companyName) {
        return { success: false, error: 'Company name is required for employer accounts' };
      }

      const users = getStoredUsers();

      if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
        return { success: false, error: 'An account with this email already exists' };
      }

      const newUser: StoredUser = {
        id: generateId(),
        email: data.email.toLowerCase(),
        name: data.name,
        role: data.role,
        passwordHash: simpleHash(data.password),
        tenantId: data.role === 'employer' ? generateId() : undefined,
        tenantName: data.companyName,
      };

      users.push(newUser);
      saveStoredUsers(users);

      const userData: User = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        tenantId: newUser.tenantId,
        tenantName: newUser.tenantName,
      };

      setUser(userData);
      localStorage.setItem('jobly_user', JSON.stringify(userData));
      return { success: true };
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
