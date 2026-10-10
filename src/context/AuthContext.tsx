'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { User, UserRole } from '@/types';
import { isSupabaseConfigured, signInWithPassword, supabase } from '@/lib/supabase';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  signIn: (
    email: string,
    password: string,
    role: UserRole,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isEditor: boolean;
  isClient: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const applySession = async (authUser: SupabaseUser | null) => {
      if (!authUser) {
        if (mounted) setCurrentUser(null);
        return;
      }

      try {
        const user = await buildAppUser(authUser);
        if (mounted) setCurrentUser(user);
      } catch (error) {
        console.error('Supabase user is not authorized for this project.', error);
        await supabase.auth.signOut();
        if (mounted) setCurrentUser(null);
      }
    };

    const restore = async () => {
      try {
        if (isSupabaseConfigured) {
          const { data } = await supabase.auth.getSession();
          const authUser = data.session?.user;
          if (authUser) {
            await applySession(authUser);
            return;
          }
        }
        setCurrentUser(null);
      } catch (error) {
        console.error('Failed to restore Supabase session.', error);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restore();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        if (mounted) {
          setCurrentUser(null);
          setIsLoading(false);
        }
        return;
      }

      // Defer the membership query so it does not run inside Supabase's auth lock.
      setTimeout(() => {
        void applySession(session.user).finally(() => {
          if (mounted) setIsLoading(false);
        });
      }, 0);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (
    email: string,
    password: string,
    role: UserRole,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { user: authUser } = await signInWithPassword(email.trim(), password);
      if (!authUser) throw new Error('Supabase did not return an authenticated user.');

      const user = await buildAppUser(authUser);
      if (user.role !== role) {
        await supabase.auth.signOut();
        throw new Error(`This email is not authorized for the ${role.toLowerCase()} portal.`);
      }

      setCurrentUser(user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Could not sign in with those credentials.',
      };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    if (isSupabaseConfigured) {
      void supabase.auth.signOut();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        signIn,
        logout,
        isEditor: currentUser?.role === 'Editor',
        isClient: currentUser?.role === 'Client',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

async function buildAppUser(authUser: SupabaseUser): Promise<User> {
  const email = authUser.email?.trim().toLowerCase();
  if (!email) throw new Error('Your Supabase account does not have an email address.');

  const { data: membership, error } = await supabase
    .from('project_members')
    .select('role, display_name, company_name')
    .eq('email', email)
    .eq('project_id', 'proj_promo_2026')
    .maybeSingle();

  if (error) throw error;
  if (!membership) {
    throw new Error('This email is not assigned to the SyncCut project.');
  }

  const role: UserRole =
    membership.role === 'Editor' || membership.role === 'Client'
      ? membership.role
      : 'Client';
  const metadata = authUser.user_metadata ?? {};

  return {
    user_id: authUser.id,
    name: membership.display_name || metadata.name || email,
    email,
    role,
    company_name: membership.company_name || metadata.company_name || '',
  };
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
