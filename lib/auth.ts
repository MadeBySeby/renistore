import { createClient } from "./supabase/server";

export interface Profile {
  id: string;
  email: string;
  role: "user" | "admin";
  created_at?: string;
}
export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return null;
  }
  return user;
}

export async function getUserProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    return null;
  }
  return data || null;
}

export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const profile = await getUserProfile(user.id);
  return profile?.role === "admin";
}
