'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { mockClientUser, mockEditorUser } from '@/lib/mock-data';
import { sendMagicLink, verifyOtpCode } from '@/lib/supabase';

export interface SignupProfile {
  name: string;
  companyName: string;
}

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  loginAs: (role: UserRole) => void;
  loginWithEmail: (email: string) => { success: boolean; message: string };
  requestMagicLink: (email: string, role: UserRole, profile?: SignupProfile) => Promise<{ success: boolean; demoCode?: string | null; error?: string }>;
  verifyCode: (email: string, code: string, role: UserRole, profile?: SignupProfile) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isEditor: boolean;
  isClient: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('synccut_auth_user');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      } else {
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
    
    if (cleanEmail === mockEditorUser.email.toLowerCase() || cleanEmail.includes('editor') || cleanEmail.includes('luminary')) {
      loginAs('Editor');
      return { success: true, message: `Welcome back, ${mockEditorUser.name} (Editor Cockpit)` };
    }
    
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

  const requestMagicLink = async (email: string, role: UserRole, profile?: SignupProfile): Promise<{ success: boolean; demoCode?: string | null; error?: string }> => {
    try {
      const redirectUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/${role.toLowerCase()}`
        : `/${role.toLowerCase()}`;
      
      const { demoCode } = await sendMagicLink(email.trim(), redirectUrl, profile ? {
        name: profile.name,
        company_name: profile.companyName,
        role,
      } : undefined);
      return { success: true, demoCode };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to send magic link' };
    }
  };

  const verifyCode = async (email: string, code: string, role: UserRole, profile?: SignupProfile): Promise<{ success: boolean; error?: string }> => {
    try {
      const { user: authUser } = await verifyOtpCode(email.trim(), code.trim());
      
      // Successfully authenticated
      const metadata = authUser?.user_metadata;
      const user: User = profile
        ? {
            user_id: authUser?.id || email.trim(),
            name: metadata?.name || profile.name,
            email: email.trim(),
            role,
            company_name: metadata?.company_name || profile.companyName,
          }
        : role === 'Editor'
          ? { ...mockEditorUser, email: email.trim() }
          : { ...mockClientUser, email: email.trim() };

      setCurrentUser(user);
      try {
        localStorage.setItem('synccut_auth_user', JSON.stringify(user));
      } catch (e) {
        console.error(e);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Invalid or expired verification code' };
    }
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
        requestMagicLink,
        verifyCode,
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
