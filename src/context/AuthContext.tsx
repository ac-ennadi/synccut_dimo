'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { mockClientUser, mockEditorUser } from '@/lib/mock-data';
import { isSupabaseConfigured, sendMagicLink, supabase, verifyOtpCode } from '@/lib/supabase';

export interface SignupProfile {
  name: string;
  companyName: string;
}

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  /** Instant no-auth login for development / demo testing. */
  loginAs: (role: UserRole) => void;
  /** Step 1 — send magic link / OTP email. Returns demo code in dev mode. */
  requestMagicLink: (
    email: string,
    role: UserRole,
    profile?: SignupProfile,
  ) => Promise<{ success: boolean; demoCode?: string | null; error?: string }>;
  /** Step 2 — verify 6-digit OTP and set currentUser. */
  verifyCode: (
    email: string,
    code: string,
    role: UserRole,
    profile?: SignupProfile,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isEditor: boolean;
  isClient: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'synccut_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        if (isSupabaseConfigured) {
          // Attempt to restore a live Supabase session
          const { data } = await supabase.auth.getSession();
          const authUser = data.session?.user;
          if (authUser) {
            const meta = authUser.user_metadata ?? {};
            setCurrentUser({
              user_id: authUser.id,
              name: meta.name || authUser.email || 'User',
              email: authUser.email || '',
              role: meta.role === 'Editor' ? 'Editor' : 'Client',
              company_name: meta.company_name || '',
            });
            return;
          }
        } else {
          // Demo mode — restore from localStorage
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            setCurrentUser(JSON.parse(saved));
            return;
          }
        }
        setCurrentUser(null);
      } catch {
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    restore();
  }, []);

  /** Instant demo / dev login — skips OTP entirely. */
  const loginAs = (role: UserRole) => {
    const user = role === 'Editor' ? mockEditorUser : mockClientUser;
    setCurrentUser(user);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
  };

  /** Step 1: Send magic link / OTP (or simulate in demo mode). */
  const requestMagicLink = async (
    email: string,
    role: UserRole,
    profile?: SignupProfile,
  ): Promise<{ success: boolean; demoCode?: string | null; error?: string }> => {
    try {
      const redirectUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}/${role.toLowerCase()}`
          : `/${role.toLowerCase()}`;

      const { demoCode } = await sendMagicLink(
        email.trim(),
        redirectUrl,
        profile
          ? { name: profile.name, company_name: profile.companyName, role }
          : { role },
      );

      return { success: true, demoCode };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to send magic link.' };
    }
  };

  /** Step 2: Verify OTP and create the user session. */
  const verifyCode = async (
    email: string,
    code: string,
    role: UserRole,
    profile?: SignupProfile,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { user: authUser } = await verifyOtpCode(email.trim(), code.trim());

      const meta = (authUser as any)?.user_metadata ?? {};
      const user: User = {
        user_id: (authUser as any)?.id || email.trim(),
        name: profile?.name || meta.name || email.trim(),
        email: email.trim(),
        role,
        company_name: profile?.companyName || meta.company_name || '',
      };

      setCurrentUser(user);
      try {
        // Keep localStorage copy so demo mode survives page reloads
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } catch (e) {
        console.error(e);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Invalid or expired verification code.' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
    if (isSupabaseConfigured) {
      void supabase.auth.signOut();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        loginAs,
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
