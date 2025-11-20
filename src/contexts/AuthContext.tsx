import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IPTVCredentials, AuthResponse } from '../types/iptv.types';
import { iptvService } from '../services/iptv.service';
import { storage } from '../utils/storage';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  credentials: IPTVCredentials | null;
  authData: AuthResponse | null;
  login: (credentials: IPTVCredentials) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [credentials, setCredentials] = useState<IPTVCredentials | null>(null);
  const [authData, setAuthData] = useState<AuthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check for saved credentials on mount
  useEffect(() => {
    checkSavedCredentials();
  }, []);

  const checkSavedCredentials = async () => {
    try {
      setIsLoading(true);
      const savedCredentials = await storage.getCredentials();
      
      if (savedCredentials) {
        // Attempt to authenticate with saved credentials
        iptvService.setCredentials(savedCredentials);
        const response = await iptvService.authenticate();
        
        setCredentials(savedCredentials);
        setAuthData(response);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auto-login failed:', error);
      // Clear invalid credentials
      await storage.clearCredentials();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (newCredentials: IPTVCredentials) => {
    try {
      setIsLoading(true);
      setError(null);

      // Set credentials in service
      iptvService.setCredentials(newCredentials);
      
      // Authenticate
      const response = await iptvService.authenticate();
      
      // Save credentials
      await storage.saveCredentials(newCredentials);
      
      setCredentials(newCredentials);
      setAuthData(response);
      setIsAuthenticated(true);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Authentication failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await storage.clearCredentials();
      
      setCredentials(null);
      setAuthData(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    credentials,
    authData,
    login,
    logout,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
