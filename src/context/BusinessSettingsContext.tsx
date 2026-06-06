"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { fetchSettings, saveSettings, type SettingsMap } from "@/lib/settingsService";

interface BusinessSettingsContextValue {
  settings: SettingsMap;
  save: (updates: Partial<SettingsMap>) => Promise<void>;
  loading: boolean;
}

const defaults: SettingsMap = {
  shop_name: "KATAS PH",
  address: "Philippines",
  phone: "",
  receipt_footer: "PLEASE COME AGAIN!",
};

const BusinessSettingsContext = createContext<BusinessSettingsContextValue>({
  settings: defaults,
  save: async () => {},
  loading: true,
});

export function BusinessSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SettingsMap>(defaults);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings()
      .then(setSettings)
      .finally(() => setLoading(false));
  }, []);

  const save = async (updates: Partial<SettingsMap>) => {
    await saveSettings(updates);
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  return (
    <BusinessSettingsContext.Provider value={{ settings, save, loading }}>
      {children}
    </BusinessSettingsContext.Provider>
  );
}

export const useBusinessSettings = () => useContext(BusinessSettingsContext);
