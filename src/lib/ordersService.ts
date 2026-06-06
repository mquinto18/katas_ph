import { supabase } from "./supabase";

export type OrderItem = {
  name: string;
  quantity: number;
  price: number;
};

export type OrderRecord = {
  id: number;
  order_type: string;
  payment: string;
  total: number;
  items: OrderItem[];
  created_at: string;
};

export async function insertOrder(order: Omit<OrderRecord, "id" | "created_at">): Promise<void> {
  const { error } = await supabase.from("orders").insert(order);
  if (error) throw new Error(JSON.stringify(error));
}

export async function fetchOrders(): Promise<OrderRecord[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(JSON.stringify(error));
  return data as OrderRecord[];
}
