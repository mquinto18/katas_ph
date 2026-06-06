import { supabase } from "./supabase";

export type Category = { id: number; label: string; value: string };

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from("categories").select("*").order("created_at");
  if (error) throw new Error(JSON.stringify(error));
  return data as Category[];
}

export async function addCategory(label: string, value: string): Promise<Category> {
  const { data, error } = await supabase
    .from("categories")
    .insert({ label, value })
    .select()
    .single();
  if (error) throw new Error(JSON.stringify(error));
  return data as Category;
}

export async function removeCategory(id: number): Promise<void> {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(JSON.stringify(error));
}
