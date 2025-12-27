'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type UserType = 'jobseeker' | 'employer' | null;

interface AuthContextType {
  userType: UserType;
  isLoggedIn: boolean;
  login: (type: 'jobseeker' | 'employer') => void;
  logout: () => void;
  getDashboardPath: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userType, setUserType] = useState<UserType>(null);

  useEffect(() => {
    // Load user type from localStorage on mount
    const savedUserType = localStorage.getItem('jobly_user_type') as UserType;
    if (savedUserType) {
      setUserType(savedUserType);
    }
  }, []);

  const login = (type: 'jobseeker' | 'employer') => {
    setUserType(type);
    localStorage.setItem('jobly_user_type', type);
  };

  const logout = () => {
    setUserType(null);
    localStorage.removeItem('jobly_user_type');
  };

  const getDashboardPath = () => {
    if (userType === 'employer') {
      return '/employer/dashboard';
    } else if (userType === 'jobseeker') {
      return '/dashboard';
    }
    return '/auth';
  };

  return (
    <AuthContext.Provider value={{
      userType,
      isLoggedIn: userType !== null,
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
