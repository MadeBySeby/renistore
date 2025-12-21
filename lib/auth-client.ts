import { redirect } from "next/navigation";
import { createClient } from "./supabase/client";
const supabase = createClient();
export async function signUpWithEmail(
  email: string,
  password: string,
  name: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      name: name.trim(),
    } as Record<string, any>,
  });

  if (error) throw error;
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
