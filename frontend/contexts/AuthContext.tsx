import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser, login as apiLogin, register as apiRegister, logout as apiLogout, User } from '../services/auth';
import { getToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, name: string, role: 'customer' | 'business') => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;  // ← BU SATIRI EKLE
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Uygulama açıldığında token var mı kontrol et
  useEffect(() => {
    bootstrap();
  }, []);

  async function bootstrap() {
    try {
      const token = await getToken();
      if (token) {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      // Token geçersizse user null kalır
      console.log('Otomatik giriş başarısız:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogin(email: string, password: string): Promise<User> {
    const loggedInUser = await apiLogin(email, password);
    setUser(loggedInUser);
    return loggedInUser;
  }
  async function refreshUser() {
  try {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  } catch (err) {
    console.log('User refresh failed:', err);
  }
}

  async function handleRegister(
    email: string,
    password: string,
    name: string,
    role: 'customer' | 'business'
  ): Promise<User> {
    const newUser = await apiRegister(email, password, name, role);
    setUser(newUser);
    return newUser;
  }

  async function handleLogout() {
    await apiLogout();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        refreshUser, 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
