import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, onAuthStateChange, getProfile, signInWithEmail, signUpWithEmail, signOut as supabaseSignOut } from '@/lib/supabase';

type UserProfile = null | { id: string; full_name?: string; email?: string; role?: string; trust_score?: number };

type AuthContextValue = {
  user: any | null;
  profile: UserProfile;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (payload: { full_name: string; email: string; password: string }) => Promise<any>;
  signOut: () => Promise<any>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        if (!mounted) return;
        setUser(currentUser);
        if (currentUser) {
          const { data } = await getProfile(currentUser.id as string);
          if (mounted) setProfile(data ?? null);
        }
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    const { data: sub } = onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        const { data } = await getProfile(currentUser.id as string);
        setProfile(data ?? null);
        navigate('/dashboard');
      } else {
        setProfile(null);
        navigate('/');
      }
    }) as any;

    return () => {
      mounted = false;
      try {
        sub?.subscription?.unsubscribe?.();
      } catch (e) {
        // noop
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const res = await signInWithEmail(email, password);
    setLoading(false);
    if (res.error) throw res.error;
    return res;
  };

  const signUp = async ({ full_name, email, password }: { full_name: string; email: string; password: string }) => {
    setLoading(true);
    const res = await signUpWithEmail({ email, password, full_name });
    setLoading(false);
    if (res.error) throw res.error;
    return res;
  };

  const signOut = async () => {
    setLoading(true);
    await supabaseSignOut();
    setUser(null);
    setProfile(null);
    setLoading(false);
    navigate('/');
  };

  const value = useMemo(
    () => ({ user, profile, loading, signIn, signUp, signOut }),
    [user, profile, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default useAuth;
