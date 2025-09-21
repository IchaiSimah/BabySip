import React, { createContext, useContext, useEffect, useState } from 'react';
import authService, { AuthState } from '../services/AuthService';

interface AuthContextType {
  authState: AuthState;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true,
  });

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = authService.addListener((newState) => {
      setAuthState(newState);
    });

    // Check authentication state on startup
    checkAuth();

    return unsubscribe;
  }, []);

  const checkAuth = async () => {
    try {
      await authService.checkAuthStatus();
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const login = async (username: string, password: string) => {
    await authService.login({ username, password });
  };

  const register = async (username: string, email: string, password: string) => {
    await authService.register({ username, email, password });
  };

  const logout = async () => {
    await authService.logout();
  };

  const value: AuthContextType = {
    authState,
    login,
    register,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
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