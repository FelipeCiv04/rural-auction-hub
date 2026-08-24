import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "./supabase";
import type { Database } from "@/types/database";
import type { Session, User } from "@supabase/supabase-js";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

type AuthContextValue = {
  isConfigured: boolean;
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: ProfileRow | null;
  role: string | null;
  signUp: (payload: {
    email: string;
    password: string;
    full_name?: string;
    phone?: string;
  }) => Promise<{ error?: Error | null }>;
  signIn: (payload: { email: string; password: string }) => Promise<{ error?: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const configured = isSupabaseConfigured();
  const [loading, setLoading] = useState<boolean>(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [role, setRole] = useState<string | null>(null);

  async function loadSessionAndProfile() {
    if (!configured || !supabase) {
      setLoading(false);
      return;
    }

    const { data: s } = await supabase.auth.getSession();
    const sess = s?.session ?? null;
    setSession(sess);
    setUser(sess?.user ?? null);

    if (sess?.user?.id) {
      try {
        const res = await supabase.from("profiles").select("*").eq("id", sess.user.id).single();
        const data = res.data as ProfileRow | null;
        if (data) {
          setProfile(data);
          setRole(data.role ?? null);
        } else {
          setProfile(null);
          setRole(null);
        }
      } catch (err) {
        console.error("[auth] failed to load profile:", err);
      }
    }

    setLoading(false);
  }

  useEffect(() => {
    void loadSessionAndProfile();

    if (!configured || !supabase) return;

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null);
      setUser(session?.user ?? null);
      // refresh profile when auth state changes
      void (async () => {
        if (!supabase) return;
        if (session?.user?.id) {
          try {
            const res = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();
            const data = res.data as ProfileRow | null;
            setProfile(data ?? null);
            setRole(data?.role ?? null);
          } catch (err) {
            console.error("[auth] failed to refresh profile:", err);
          }
        } else {
          setProfile(null);
          setRole(null);
        }
      })();
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signUp({
    email,
    password,
    full_name,
    phone,
  }: {
    email: string;
    password: string;
    full_name?: string;
    phone?: string;
  }) {
    if (!configured || !supabase) {
      return { error: new Error("Auth not configured") };
    }

    try {
      const res = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: full_name ?? "", phone: phone ?? "" } },
      });

      if (res.error) {
        console.error("[auth] signUp error:", res.error);
        return { error: res.error };
      }

      // After sign up, the DB trigger should create the profile with default role 'user'
      return { error: null };
    } catch (err) {
      console.error("[auth] signUp unexpected:", err);
      return { error: err as Error };
    }
  }

  async function signIn({ email, password }: { email: string; password: string }) {
    if (!configured || !supabase) return { error: new Error("Auth not configured") };

    try {
      const res = await supabase.auth.signInWithPassword({ email, password });
      if (res.error) {
        console.error("[auth] signIn error:", res.error);
        return { error: res.error };
      }

      // load profile
      if (res.data?.user?.id) {
        await refreshProfile();
      }

      return { error: null };
    } catch (err) {
      console.error("[auth] signIn unexpected:", err);
      return { error: err as Error };
    }
  }

  async function signOut() {
    if (!configured || !supabase) return;
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setProfile(null);
      setRole(null);
    } catch (err) {
      console.error("[auth] signOut failed:", err);
    }
  }

  async function refreshProfile() {
    if (!configured || !supabase) return;
    try {
      const s = await supabase.auth.getSession();
      const sess = s.data?.session ?? null;
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user?.id) {
        const res = await supabase.from("profiles").select("*").eq("id", sess.user.id).single();
        const data = res.data as ProfileRow | null;
        setProfile(data ?? null);
        setRole(data?.role ?? null);
      }
    } catch (err) {
      console.error("[auth] refreshProfile failed:", err);
    }
  }

  const value: AuthContextValue = {
    isConfigured: configured,
    loading,
    session,
    user,
    profile,
    role,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export default AuthProvider;
