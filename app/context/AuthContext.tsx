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

interface User {
  token: string;
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (token: string, userData: User) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const LoadingIndicator = () => <div>Loading...</div>;

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/user");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          console.log("Navbar user:", data);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const signIn = async (token: string, userData: User) => {
    try {
      setUser(userData);
    } catch (error) {
      console.error(error);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      router.replace("/login");
      setUser(null);
    } catch (error) {
      console.error(error);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
