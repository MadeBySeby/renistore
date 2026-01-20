"use client";
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { redirect, useRouter } from "next/navigation";
import { User, AuthChangeEvent, Session } from "@supabase/supabase-js";
import { useLocale } from "next-intl";
interface Profile {
  name?: string;
  role: "user" | "admin";
}
interface AuthContextType {
  isAdmin?: boolean;
  profile?: Profile | null;
  user: User | null;
  loading: boolean;
  session: any;
  signOut: () => Promise<void>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{
    data: unknown;
    error: string | null;
    success: boolean | null;
  }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// const LoadingIndicator = () => <div>Loading...</div>;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const locale = useLocale();

  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const currentUser = session?.user || null;
        setUser(currentUser);
        setSession(session);
        if (currentUser) {
          const { data } = await supabase
            .from("profiles")
            .select("name, role")
            .eq("id", currentUser.id)
            .single();
          console.log(" profile from data:", data);
          setProfile(data);
          setIsAdmin(data?.role === "admin");
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        const currentUser = session?.user || null;
        setUser(currentUser);
        setSession(session);
        if (currentUser) {
          const { data } = await supabase
            .from("profiles")
            .select("name, role")
            .eq("id", currentUser.id)
            .single();
          console.log(" profile from data:", data);
          setProfile(data);
          setIsAdmin(data?.role === "admin");
        } else {
          setProfile(null);
          setIsAdmin(false);
        }
      },
    );
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLocaleLowerCase(),
        password: password,
      });
      if (error) {
        console.error("Supabase sign-in error:", error.message);
        return { data: null, error: error.message, success: false };
      }

      console.log("Supabase sign-in success:", data);
      router.refresh();
      router.push(`/${locale}/`);

      return { data, error: null, success: true };
    } catch (error: any) {
      console.error(error);
      return {
        data: null,
        error: error?.message || "Sign in failed",
        success: false,
      };
    }
  };
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      router.refresh();
      router.push(`/${locale}/`);
    } catch (error) {
      console.error(error);
    }
  };

  const value = {
    user,
    loading,
    signOut,
    signIn,
    isAdmin,
    profile,
    session,
  };

  // if (loading) {
  //   return <LoadingIndicator />;
  // }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
