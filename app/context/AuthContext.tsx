"use client";
import React, { createContext, useState, useEffect, useContext, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { User, Session } from "@supabase/supabase-js";
import { useLocale } from "next-intl";

interface Profile {
  name?: string;
  role: "user" | "admin";
}

type SignInResult = {
  error: string | null;
  success: boolean;
  isAdmin: boolean;
};

interface AuthContextType {
  isAdmin: boolean;
  profile: Profile | null | undefined;
  user: User | null;
  loading: boolean;
  session: Session | null;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PROFILE_STORAGE_KEY = "renistore.profile";

function readStoredProfile(userId: string): Profile | null | undefined {
  try {
    const raw = sessionStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return undefined;
    const stored = JSON.parse(raw) as { userId: string; profile: Profile | null };
    return stored.userId === userId ? stored.profile : undefined;
  } catch {
    return undefined;
  }
}

function storeProfile(userId: string | null, profile: Profile | null) {
  try {
    if (!userId) sessionStorage.removeItem(PROFILE_STORAGE_KEY);
    else sessionStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({ userId, profile }));
  } catch {
    // Storage can be unavailable (private mode); the profile is simply refetched.
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const locale = useLocale();
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const profileLoadedFor = useRef<string | null>(null);

  const isAdmin = profile?.role === "admin";

  async function fetchProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("name, role")
      .eq("id", userId)
      .maybeSingle();
    if (error) console.error("Error loading profile:", error.message);
    const loaded = data ?? null;
    profileLoadedFor.current = userId;
    storeProfile(userId, loaded);
    return loaded;
  }

  useEffect(() => {
    let active = true;

    // Supabase holds an auth lock while this callback runs; awaiting another
    // Supabase call inside it deadlocks sign-in, so the profile load is deferred.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      const nextUser = nextSession?.user ?? null;
      setSession(nextSession);
      setUser(nextUser);

      if (!nextUser) {
        profileLoadedFor.current = null;
        storeProfile(null, null);
        setProfile(null);
        setLoading(false);
        return;
      }

      // Token refreshes and the SIGNED_IN event after signIn() reuse the loaded profile.
      if (profileLoadedFor.current === nextUser.id) {
        setLoading(false);
        return;
      }

      const stored = readStoredProfile(nextUser.id);
      if (stored !== undefined) {
        setProfile(stored);
        setLoading(false);
      }

      setTimeout(async () => {
        const nextProfile = await fetchProfile(nextUser.id);
        if (!active) return;
        setProfile(nextProfile);
        setLoading(false);
      }, 0);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  const signIn = async (email: string, password: string): Promise<SignInResult> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) {
        return { error: error.message, success: false, isAdmin: false };
      }

      const signedInProfile = await fetchProfile(data.user.id);
      setProfile(signedInProfile);
      return { error: null, success: true, isAdmin: signedInProfile?.role === "admin" };
    } catch (error: unknown) {
      return {
        error: error instanceof Error ? error.message : "Sign in failed",
        success: false,
        isAdmin: false,
      };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error(error);
    }
    profileLoadedFor.current = null;
    storeProfile(null, null);
    setUser(null);
    setSession(null);
    setProfile(null);
    router.replace(`/${locale}`);
    router.refresh();
  };

  const refreshProfile = async () => {
    if (!user) return;
    setProfile(await fetchProfile(user.id));
  };

  const value = {
    user,
    loading,
    signOut,
    signIn,
    isAdmin,
    profile,
    session,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
