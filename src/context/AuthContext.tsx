'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { User, UserRole } from '@/types';
import { isSupabaseConfigured, signInWithPassword, signOutAndClearCaches, supabase } from '@/lib/supabase';

interface AuthContextType {
  currentUser: User | null;
  /** True until we know whether a session exists AND who it belongs to. */
  isLoading: boolean;
  signIn: (email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isEditor: boolean;
  isClient: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// High-speed in-memory cache for user metadata to avoid redundant lookups.
const appUserCache = new Map<string, User>();
const userSessionCachePrefix = 'synccut_user_v2_';

function clearAllUserCaches() {
  appUserCache.clear();
  try {
    if (typeof window !== 'undefined') {
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (k?.startsWith('synccut_user_')) keysToRemove.push(k);
      }
      keysToRemove.forEach((k) => sessionStorage.removeItem(k));
    }
  } catch {
    // Ignore storage errors
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const signingIn = useRef(false);

  useEffect(() => {
    let mounted = true;

    const apply = async (authUser: SupabaseUser, accessToken?: string) => {
      try {
        const user = await buildAppUser(authUser, accessToken);
        if (mounted) setCurrentUser(user);
      } catch (error) {
        console.error('This Supabase account is not assigned to a SyncCut project.', error);
        await signOutAndClearCaches();
        clearAllUserCaches();
        if (mounted) setCurrentUser(null);
      }
    };

    const restore = async () => {
      try {
        if (isSupabaseConfigured) {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user) {
            await apply(data.session.user, data.session.access_token);
            return;
          }
        }
        if (mounted) setCurrentUser(null);
      } catch (error) {
        console.error('Failed to restore the Supabase session.', error);
        if (mounted) setCurrentUser(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void restore();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (signingIn.current) return;
      if (!session?.user) {
        clearAllUserCaches();
        if (mounted) {
          setCurrentUser(null);
          setIsLoading(false);
        }
        return;
      }
      setTimeout(() => {
        void apply(session.user, session.access_token);
      }, 0);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string, role: UserRole) => {
    signingIn.current = true;
    setIsLoading(true);
    try {
      const { user, session } = await signInWithPassword(email.trim(), password);
      if (!user) throw new Error('Supabase did not return an authenticated user.');

      clearAllUserCaches();
      const appUser = await buildAppUser(user, session?.access_token);
      if (appUser.role !== role) {
        await signOutAndClearCaches();
        clearAllUserCaches();
        throw new Error(`This account is a ${appUser.role.toLowerCase()} account. Use the ${appUser.role.toLowerCase()} sign-in page instead.`);
      }
      setCurrentUser(appUser);
      return { success: true };
    } catch (error) {
      return { success: false, error: describeSignInError(error) };
    } finally {
      signingIn.current = false;
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearAllUserCaches();
    setCurrentUser(null);
    setIsLoading(true);
    void signOutAndClearCaches().finally(() => setIsLoading(false));
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      currentUser,
      isLoading,
      signIn,
      logout,
      isEditor: currentUser?.role === 'Editor',
      isClient: currentUser?.role === 'Client',
    }),
    [currentUser, isLoading, signIn, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

function describeSignInError(error: unknown): string {
  const message = error instanceof Error ? error.message : '';
  if (/invalid login credentials/i.test(message)) return 'That email and password combination was not accepted. Check both and try again.';
  if (/email not confirmed/i.test(message)) return 'This account still needs confirmation. Ask your project editor to re-create it.';
  if (/failed to fetch|network|load failed/i.test(message)) return 'Could not reach the server. Check your connection and try again.';
  if (/rate limit|too many/i.test(message)) return 'Too many attempts. Wait a moment before trying again.';
  return message || 'Could not sign in. Please try again.';
}

async function buildAppUser(authUser: SupabaseUser, accessToken?: string): Promise<User> {
  const email = authUser.email?.trim().toLowerCase();
  if (!email) throw new Error('Your Supabase account does not have an email address.');

  // 1. In-memory cache hit
  const cached = appUserCache.get(authUser.id);
  if (cached && cached.email === email && !accessToken) return cached;

  // 2. Instant SessionStorage cache hit (accelerates page transitions and reloads)
  try {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(`${userSessionCachePrefix}${authUser.id}`);
      if (stored) {
        const parsed = JSON.parse(stored) as User;
        if (parsed && parsed.email === email && !accessToken) {
          appUserCache.set(authUser.id, parsed);
          return parsed;
        }
      }
    }
  } catch {
    // Ignore storage access errors
  }

  // The configured editor identity is authoritative. Check it before reading
  // client memberships so an editor who is also assigned to a client project
  // cannot be routed through the client portal.
  if (accessToken) {
    const editorRes = await fetch('/api/auth/profile', {
      headers: { Authorization: `Bearer ${accessToken}` },
    }).catch(() => null);
    if (editorRes?.ok) {
      const payload = (await editorRes.json()) as { user?: User };
      if (payload.user?.role === 'Editor' && payload.user.user_id === authUser.id) {
        appUserCache.set(authUser.id, payload.user);
        try {
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(`${userSessionCachePrefix}${authUser.id}`, JSON.stringify(payload.user));
          }
        } catch {}
        return payload.user;
      }
    }
  }

  // 3. Fast direct database lookup (runs in single round-trip with user's JWT)
  const { data: members, error: membersError } = await supabase
    .from('project_members')
    .select('project_id,role,display_name,company_name')
    .eq('email', email);

  if (membersError) {
    console.warn('Direct membership lookup error:', membersError);
  }

  const clientMembers = members?.filter((m) => m.role === 'Client') ?? [];

  if (clientMembers.length > 0) {
    const projectIds = [...new Set(clientMembers.map((m) => m.project_id))];
    const projectTitles: Record<string, string> = {};

    // Fetch project titles directly from project_portal_state in parallel
    const { data: states } = await supabase
      .from('project_portal_state')
      .select('project_id,state')
      .in('project_id', projectIds);

    for (const row of states ?? []) {
      const stateObj = row.state as { project?: { title?: string } };
      if (stateObj?.project?.title) {
        projectTitles[row.project_id] = stateObj.project.title.trim();
      }
    }

    const first = clientMembers[0];
    const meta = authUser.user_metadata ?? {};
    const user: User = {
      user_id: authUser.id,
      name: first.display_name || meta.name || email,
      email,
      role: 'Client',
      company_name: first.company_name || meta.company_name || '',
      project_id: first.project_id,
      project_ids: projectIds,
      project_titles: projectTitles,
    };
    appUserCache.set(authUser.id, user);
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`${userSessionCachePrefix}${authUser.id}`, JSON.stringify(user));
      }
    } catch {}
    return user;
  }

  // 4. Fallback endpoints if direct RLS lookup returned no rows (e.g. new editor setup)
  if (accessToken) {
    const [clientRes, editorRes] = await Promise.all([
      fetch('/api/auth/client-projects', { headers: { Authorization: `Bearer ${accessToken}` } }).catch(() => null),
      fetch('/api/auth/profile', { headers: { Authorization: `Bearer ${accessToken}` } }).catch(() => null),
    ]);

    if (clientRes?.ok) {
      const payload = (await clientRes.json()) as { user?: User };
      if (payload.user) {
        appUserCache.set(authUser.id, payload.user);
        try {
          if (typeof window !== 'undefined') sessionStorage.setItem(`${userSessionCachePrefix}${authUser.id}`, JSON.stringify(payload.user));
        } catch {}
        return payload.user;
      }
    }

    if (editorRes?.ok) {
      const payload = (await editorRes.json()) as { user?: User };
      if (payload.user) {
        appUserCache.set(authUser.id, payload.user);
        try {
          if (typeof window !== 'undefined') sessionStorage.setItem(`${userSessionCachePrefix}${authUser.id}`, JSON.stringify(payload.user));
        } catch {}
        return payload.user;
      }
    }
  }

  throw new Error('This email is not assigned to a SyncCut project. Ask your editor for access.');
}

export const useAuth = () => {
  const c = useContext(AuthContext);
  if (!c) throw new Error('useAuth must be used within an AuthProvider');
  return c;
};
