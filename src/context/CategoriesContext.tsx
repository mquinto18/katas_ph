"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  fetchCategories,
  addCategory as svcAdd,
  removeCategory as svcRemove,
  type Category,
} from "@/lib/categoriesService";

interface CategoriesContextValue {
  categories: Category[];
  categoryMap: Record<string, string>;
  add: (label: string, value: string) => Promise<void>;
  remove: (id: number) => Promise<void>;
  loading: boolean;
}

const CategoriesContext = createContext<CategoriesContextValue>({
  categories: [],
  categoryMap: {},
  add: async () => {},
  remove: async () => {},
  loading: true,
});

export function CategoriesProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .finally(() => setLoading(false));
  }, []);

  const categoryMap = Object.fromEntries(categories.map((c) => [c.value, c.label]));

  const add = async (label: string, value: string) => {
    const newCat = await svcAdd(label, value);
    setCategories((prev) => [...prev, newCat]);
  };

  const remove = async (id: number) => {
    await svcRemove(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <CategoriesContext.Provider value={{ categories, categoryMap, add, remove, loading }}>
      {children}
    </CategoriesContext.Provider>
  );
}

export const useCategories = () => useContext(CategoriesContext);
