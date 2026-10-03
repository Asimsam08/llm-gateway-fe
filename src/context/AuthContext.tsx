"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, LoginCredentials, RegisterCredentials } from "@/types/auth";
import { authService } from "@/services/authService";
import { getStoredToken } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session on mount from stored credentials
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = getStoredToken();
        const storedUser = await authService.getCurrentUser();

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
        } else {
          setToken(null);
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to restore auth session:", error);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Cross-tab synchronization
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "llm_gateway_token" || e.key === "llm_gateway_user") {
        const updatedToken = getStoredToken();
        const updatedUser = authService.getStoredUser();
        setToken(updatedToken);
        setUser(updatedUser);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      setToken(response.token || null);
      setUser(response.user || null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    try {
      const response = await authService.register(credentials);
      setToken(response.token || null);
      setUser(response.user || null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const demoLogin = useCallback(async () => {
    setIsLoading(true);
    try {
      const demoUser: User = {
        id: "demo-user-1",
        name: "Alex Vance",
        email: "alex.vance@gateway.ai",
        createdAt: new Date().toISOString(),
      };
      const response = await authService.mockAuthenticate(demoUser);
      setToken(response.token || null);
      setUser(response.user || null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        demoLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

