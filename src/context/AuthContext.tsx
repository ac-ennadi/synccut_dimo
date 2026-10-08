'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { mockClientUser, mockEditorUser } from '@/lib/mock-data';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  loginAs: (role: UserRole) => void;
  loginWithEmail: (email: string) => { success: boolean; message: string };
  logout: () => void;
  isEditor: boolean;
  isClient: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage or default to Client
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('synccut_auth_user');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      } else {
        // Default to null so user lands on login page, or default to client
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginAs = (role: UserRole) => {
    const user = role === 'Editor' ? mockEditorUser : mockClientUser;
    setCurrentUser(user);
    try {
      localStorage.setItem('synccut_auth_user', JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
  };

  const loginWithEmail = (email: string): { success: boolean; message: string } => {
    const cleanEmail = email.trim().toLowerCase();
    
    // Check if email belongs to editor
    if (cleanEmail === mockEditorUser.email.toLowerCase() || cleanEmail.includes('editor') || cleanEmail.includes('luminary')) {
      loginAs('Editor');
      return { success: true, message: `Welcome back, ${mockEditorUser.name} (Editor Cockpit)` };
    }
    
    // Default to client
    const clientUser: User = {
      ...mockClientUser,
      email: cleanEmail,
    };
    setCurrentUser(clientUser);
    try {
      localStorage.setItem('synccut_auth_user', JSON.stringify(clientUser));
    } catch (e) {
      console.error(e);
    }
    return { success: true, message: `Welcome back, ${clientUser.name} (Client Portal)` };
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('synccut_auth_user');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        loginAs,
        loginWithEmail,
        logout,
        isEditor: currentUser?.role === 'Editor',
        isClient: currentUser?.role === 'Client',
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
