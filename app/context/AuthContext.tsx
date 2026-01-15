"use client";
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

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
    password: string
  ) => Promise<{ data: unknown; error: string | null; success: boolean }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// const LoadingIndicator = () => <div>Loading...</div>;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
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
        // Clear profile and admin status when user signs out
        setProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);
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
