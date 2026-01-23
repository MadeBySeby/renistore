import { createBrowserClient } from "@supabase/auth-helpers-nextjs";

export function createClient() {
  console.log("🔍 Creating Supabase client...");
  console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);

  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  console.log("✅ Client created:", client);
  return client;
}
