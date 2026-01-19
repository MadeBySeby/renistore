"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
// ─────────────────────────────────────────────────────────────
// SIGN IN
// ─────────────────────────────────────────────────────────────
export type AuthState = {
  error: string | null;
  success?: boolean;
};
export async function signInAction(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const locale = formData.get("locale") as string || "en";
  if (!email || !password) {
    return { error: "Email and password are required" };
  }
  const supabase = await createClient();
  
  const { error } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase(),
    password,
  });
  if (error) {
    return { error: error.message };
  }
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    const isAdmin = profile?.role === "admin";
    redirect(isAdmin ? `/${locale}/dashboard` : `/${locale}/`);
  }
  redirect(`/${locale}/`);
}
// ─────────────────────────────────────────────────────────────
// SIGN UP
// ─────────────────────────────────────────────────────────────
export async function signUpAction(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const locale = formData.get("locale") as string || "en";
  if (!email || !password || !name) {
    return { error: "All fields are required" };
  }
  const supabase = await createClient();
  
  const { error } = await supabase.auth.signUp({
    email: email.toLowerCase(),
    password,
    options: {
      data: { name: name.trim() },
    },
  });
  if (error) {
    return { error: error.message };
  }
  redirect(`/${locale}/login?registered=true`);
}
// ─────────────────────────────────────────────────────────────
// SIGN OUT
// ─────────────────────────────────────────────────────────────
export async function signOutAction(formData: FormData): Promise<void> {
  const locale = formData.get("locale") as string || "en";
  
  const supabase = await createClient();
  await supabase.auth.signOut();
  
  redirect(`/${locale}/`);
}