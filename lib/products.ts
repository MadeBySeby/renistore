import { createClient } from "./supabase/client";

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  image_url?: string;
  description?: string;
  sizes?: ProductSize[];
  created_at?: string;
}

export interface ProductSize {
  size: string;
  stock: number;
}

/** A size with this many or fewer pieces shows "only N left" in red. */
export const LOW_STOCK_LIMIT = 3;

export function productSizes(product: Pick<Product, "sizes">): ProductSize[] {
  return Array.isArray(product.sizes) ? product.sizes : [];
}

export function isSoldOut(product: Pick<Product, "sizes">): boolean {
  const sizes = productSizes(product);
  return sizes.length > 0 && sizes.every((entry) => entry.stock <= 0);
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
export async function uploadProductImage(imageFile: File): Promise<string> {
  const supabase = createClient();

  const fileExt = imageFile.name.split(".").pop();
  const fileName = `${Math.random()
    .toString(36)
    .substring(2)}-${Date.now()}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { data, error } = await supabase.storage
    .from("products")
    .upload(filePath, imageFile, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Error uploading image:", error);
    throw error;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("products").getPublicUrl(filePath);

  return publicUrl;
}
export async function addProduct(
  product: Omit<Product, "id" | "created_at" | "slug">,
  imageFile?: File
): Promise<Product> {
  const supabase = createClient();

  const slug = generateSlug(product.name);

  const { data: existing } = await supabase
    .from("products")
    .select("slug")
    .eq("slug", slug)
    .single();

  const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

  let imageUrl = product.image_url;
  if (imageFile) {
    imageUrl = await uploadProductImage(imageFile);
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      ...product,
      slug: finalSlug,
      image_url: imageUrl,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding product:", error);
    throw error;
  }

  return data;
}

export async function getAllProducts(): Promise<Product[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data || [];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    return null;
  }

  return data;
}
