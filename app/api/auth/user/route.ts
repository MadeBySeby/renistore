import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
// solution number 2 if there is volnobility with server ts
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user }, { status: 200 });
}
