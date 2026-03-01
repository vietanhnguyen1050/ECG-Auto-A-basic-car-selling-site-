import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { IUser, ILoginInput, IUserInput } from '@/types';
import { authApi } from '@/services/api';
import { clearAuthTokens, getAccessToken, setAuthTokens } from '@/lib/authTokens';

interface AuthContextType {
  user: Omit<IUser, 'password'> | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: ILoginInput) => Promise<void>;
  register: (data: IUserInput) => Promise<void>;
  refreshProfile: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Omit<IUser, 'password'> | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = async () => {
    const profile = await authApi.getProfile();
    setUser({
      _id: profile.userId,
      name: profile.displayname ?? profile.phonenumber ?? profile.userId,
      email: profile.email ?? '',
      phone: profile.phonenumber ?? undefined,
      role: profile.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setIsAuthenticated(true);
  };

  useEffect(() => {
    const hydrateUserFromToken = async () => {
      const token = getAccessToken();
      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        await refreshProfile();
      } catch {
        clearAuthTokens();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    hydrateUserFromToken();
  }, []);

  const login = async (data: ILoginInput) => {
    const loginResult = await authApi.login(data);

    setAuthTokens({
      accessToken: loginResult.accessToken,
      refreshToken: loginResult.refreshToken,
    });

    await refreshProfile();
  };

  const register = async (data: IUserInput) => {
    await authApi.register(data);
    clearAuthTokens();
    setUser(null);
    setIsAuthenticated(false);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    clearAuthTokens();
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, refreshProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
