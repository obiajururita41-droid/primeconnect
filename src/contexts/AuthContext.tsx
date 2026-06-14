import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  is_active: boolean;
  referral_code: string | null;
  referred_by: string | null;
  referral_earnings: number | null;
  loyalty_points: number | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  register: (email: string, password: string, fullName: string, phone: string, referredBy?: string) => Promise<{ error: any }>;
  login: (email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function generateReferralCode(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [loading, setLoading] = useState(true);

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (!error && data) setProfile(data as Profile);
  }

  async function fetchAdminStatus(userId: string) {
    const { data } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();
    setIsAdmin(!!data && ['admin', 'super_admin'].includes(data.role));
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await Promise.all([fetchProfile(session.user.id), fetchAdminStatus(session.user.id)]);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchAdminStatus(session.user.id);
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function register(email: string, password: string, fullName: string, phone: string, referredBy?: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error || !data.user) return { error: error ?? new Error('Signup failed') };

    let insertError: any = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      const { error: err } = await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: fullName,
        email,
        phone: phone || null,
        avatar_url: null,
        is_verified: false,
        is_active: true,
        referral_code: generateReferralCode(),
        referred_by: referredBy ?? null,
      });

      if (!err) return { error: null };

      insertError = err;

      // Retry only on referral_code collision (auto-generated, safe to retry)
      if (err.code === '23505' && err.message?.includes('referral_code')) {
        continue;
      }

      // Friendly message for duplicate phone
      if (err.code === '23505' && err.message?.includes('phone')) {
        return { error: new Error('This phone number is already registered. Please use a different number or sign in.') };
      }

      // Friendly message for duplicate email (unlikely, signUp usually catches this)
      if (err.code === '23505' && err.message?.includes('email')) {
        return { error: new Error('An account with this email already exists. Please sign in instead.') };
      }

      // Other errors: stop retrying
      break;
    }

    return { error: insertError };
  }

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }

  async function logout() {
    await supabase.auth.signOut();
    setProfile(null);
    setIsAdmin(false);
  }

  async function refreshProfile() {
    if (user) {
      await fetchProfile(user.id);
    }
  }

  return (
    <AuthContext.Provider value={{ session, user, profile, isAdmin, loading, register, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

export default AuthContext;
