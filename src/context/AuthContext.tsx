'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { isSupabaseConfigured, sendMagicLink, supabase, verifyOtpCode } from '@/lib/supabase';

export interface SignupProfile {
  name: string;
  companyName: string;
}

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  requestMagicLink: (email: string, role: UserRole, profile?: SignupProfile) => Promise<{ success: boolean; error?: string }>;
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
      if (!isSupabaseConfigured) {
        localStorage.removeItem('synccut_auth_user');
        setCurrentUser(null);
      } else {
        supabase.auth.getSession().then(({ data }) => {
          const authUser = data.session?.user;
          if (authUser) {
            const metadata = authUser.user_metadata;
            setCurrentUser({
              user_id: authUser.id,
              name: metadata?.name || authUser.email || 'User',
              email: authUser.email || '',
              role: metadata?.role === 'Editor' ? 'Editor' : 'Client',
              company_name: metadata?.company_name || '',
            });
          }
        }).catch((error) => {
          console.error('Unable to restore Supabase session:', error);
        });
      }
    } catch {
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestMagicLink = async (email: string, role: UserRole, profile?: SignupProfile): Promise<{ success: boolean; error?: string }> => {
    try {
      const redirectUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/${role.toLowerCase()}`
        : `/${role.toLowerCase()}`;
      
      await sendMagicLink(email.trim(), redirectUrl, profile ? {
        name: profile.name,
        company_name: profile.companyName,
        role,
      } : undefined);
      return { success: true };
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
        : {
            user_id: authUser?.id || email.trim(),
            name: metadata?.name || email.trim(),
            email: email.trim(),
            role,
            company_name: metadata?.company_name || '',
          };

      setCurrentUser(user);
      try {
        localStorage.removeItem('synccut_auth_user');
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
    void supabase.auth.signOut();
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
