import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { authApi, type UserDto } from '../api/authApi';

export type NormalizedRole = 'guest' | 'freelancer' | 'customer' | 'admin';

export interface AuthContextType {
  currentUser: UserDto | null;
  role: NormalizedRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  isEmailVerified: boolean;
  login: (email: string, password?: string) => Promise<UserDto>;
  logout: () => Promise<void>;
  verifyOtp: (otp: string) => Promise<UserDto>;
  resendOtp: () => Promise<void>;
  refreshUser: () => Promise<void>;
  // Test switch helper
  quickSwitchAccount: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function normalizeRole(roleStr?: string): NormalizedRole {
  if (!roleStr) return 'guest';
  const r = roleStr.toUpperCase();
  if (r === 'ADMIN') return 'admin';
  if (r === 'CUSTOMER' || r === 'EMPLOYER') return 'customer';
  if (r === 'FREELANCER') return 'freelancer';
  return 'guest';
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    try {
      const data = await authApi.getMe();
      if (data && data.authenticated && data.id) {
        setCurrentUser(data);
      } else {
        setCurrentUser(null);
      }
    } catch {
      // Backend may be offline or session expired
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password = 'demo123456'): Promise<UserDto> => {
    setIsLoading(true);
    try {
      const user = await authApi.login({ email, password });
      setCurrentUser(user);
      return user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      setCurrentUser(null);
      setIsLoading(false);
    }
  };

  const verifyOtp = async (otp: string): Promise<UserDto> => {
    if (!currentUser?.email) {
      throw new Error('Vui lòng đăng nhập để xác thực email.');
    }
    const user = await authApi.verifyOtp(currentUser.email, otp);
    setCurrentUser(user);
    return user;
  };

  const resendOtp = async () => {
    if (!currentUser?.email) return;
    await authApi.resendOtp(currentUser.email);
  };

  const quickSwitchAccount = async (email: string) => {
    await login(email, email.includes('admin') ? 'admin123456' : 'demo123456');
  };

  const role: NormalizedRole = currentUser ? normalizeRole(currentUser.role) : 'guest';
  const isEmailVerified = currentUser ? Boolean(currentUser.emailVerified) : true;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        isAuthenticated: !!currentUser,
        isLoading,
        isEmailVerified,
        login,
        logout,
        verifyOtp,
        resendOtp,
        refreshUser,
        quickSwitchAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
