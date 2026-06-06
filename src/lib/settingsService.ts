import { supabase } from "@/lib/supabase";

export type SettingsMap = {
  shop_name: string;
  address: string;
  phone: string;
  receipt_footer: string;
};

const DEFAULTS: SettingsMap = {
  shop_name: "KATAS PH",
  address: "Philippines",
  phone: "",
  receipt_footer: "PLEASE COME AGAIN!",
};

export async function fetchSettings(): Promise<SettingsMap> {
  const { data, error } = await supabase.from("settings").select("key, value");
  if (error || !data) return { ...DEFAULTS };
  const map = Object.fromEntries(data.map(({ key, value }: { key: string; value: string }) => [key, value]));
  return { ...DEFAULTS, ...map } as SettingsMap;
}

export async function saveSettings(updates: Partial<SettingsMap>): Promise<void> {
  const rows = Object.entries(updates).map(([key, value]) => ({ key, value }));
  const { error } = await supabase.from("settings").upsert(rows, { onConflict: "key" });
  if (error) throw new Error(error.message);
}
