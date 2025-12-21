import { createClient } from "@/lib/supabase/server";
import { useEffect } from "react";
// solution number 2 if there is volnobility with server ts
export async function Get() {
  const supabase = await createClient();
  const { data: products, error } = await supabase.from("products").select("*");
  if (error) {
    throw new Error("Failed to fetch products");
  }
  return Response.json(products);
}
