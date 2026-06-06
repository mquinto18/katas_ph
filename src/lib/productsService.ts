import { supabase } from "./supabase";
import { type Product, type CategoryValue } from "@/components/ProductCard";

type DbProduct = {
  id: number;
  name: string;
  category: CategoryValue;
  price: number;
  available: boolean;
  image_url: string | null;
};

export const toProduct = (row: DbProduct): Product => ({
  id:        row.id,
  name:      row.name,
  category:  row.category,
  price:     Number(row.price),
  available: row.available,
  image:     row.image_url ?? "",
});

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from("products").select("*").order("id");
  if (error) throw error;
  return (data as DbProduct[]).map(toProduct);
}

export async function updateAvailability(id: number, available: boolean): Promise<void> {
  const { error } = await supabase.from("products").update({ available }).eq("id", id);
  if (error) throw error;
}

export async function deleteProduct(id: number): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

async function uploadImage(imageFile: File): Promise<string> {
  const fileName = `${Date.now()}-${imageFile.name.replace(/\s+/g, "_")}`;
  const { data, error } = await supabase.storage
    .from("product-images")
    .upload(fileName, imageFile, { upsert: false });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(data.path);
  return urlData.publicUrl;
}

export async function addProduct(product: Omit<Product, "id">, imageFile?: File): Promise<Product> {
  const imageUrl = imageFile ? await uploadImage(imageFile) : null;
  const { data, error } = await supabase
    .from("products")
    .insert({
      name:      product.name,
      category:  product.category,
      price:     product.price,
      available: product.available,
      image_url: imageUrl,
    })
    .select()
    .single();
  if (error) throw error;
  return toProduct(data as DbProduct);
}

export async function editProduct(updated: Product, imageFile?: File): Promise<Product> {
  const imageUrl = imageFile ? await uploadImage(imageFile) : updated.image;
  const { error } = await supabase
    .from("products")
    .update({
      name:      updated.name,
      category:  updated.category,
      price:     updated.price,
      available: updated.available,
      image_url: imageUrl || null,
    })
    .eq("id", updated.id);
  if (error) throw error;
  return { ...updated, image: imageUrl };
}
