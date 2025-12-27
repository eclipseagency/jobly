'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

type UserType = 'jobseeker' | 'employer' | null;

interface AuthContextType {
  userType: UserType;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (type: 'jobseeker' | 'employer') => void;
  logout: () => void;
  getDashboardPath: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userType, setUserType] = useState<UserType>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user type from localStorage on mount
  useEffect(() => {
    try {
      const savedUserType = localStorage.getItem('jobly_user_type') as UserType;
      if (savedUserType && (savedUserType === 'jobseeker' || savedUserType === 'employer')) {
        setUserType(savedUserType);
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((type: 'jobseeker' | 'employer') => {
    // Only update if the type is different
    setUserType(prevType => {
      if (prevType !== type) {
        try {
          localStorage.setItem('jobly_user_type', type);
        } catch (error) {
          console.error('Error saving auth state:', error);
        }
        return type;
      }
      return prevType;
    });
  }, []);

  const logout = useCallback(() => {
    setUserType(null);
    try {
      localStorage.removeItem('jobly_user_type');
    } catch (error) {
      console.error('Error clearing auth state:', error);
    }
  }, []);

  const getDashboardPath = useCallback(() => {
    if (userType === 'employer') {
      return '/employer/dashboard';
    } else if (userType === 'jobseeker') {
      return '/dashboard';
    }
    return '/auth';
  }, [userType]);

  return (
    <AuthContext.Provider value={{
      userType,
      isLoggedIn: userType !== null,
      isLoading,
      login,
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
