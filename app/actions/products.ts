"use server";
import { updateTag } from "next/cache";
import { isAdmin } from "@/lib/auth";
import { PRODUCTS_TAG } from "@/lib/products-server";

export async function refreshProductsCache(): Promise<void> {
  if (!(await isAdmin())) return;
  updateTag(PRODUCTS_TAG);
}
