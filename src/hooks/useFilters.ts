"use client";

import { useRouter, useSearchParams } from "next/navigation";

export const useFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const min = Number(searchParams.get("min")) || 0;
  const max = Number(searchParams.get("max")) || 0;
  const category = searchParams.get("category") || "";

  const setFilter = (newFilters: Record<string, any>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newFilters).forEach(([key, value]) => {
      if (!value && value !== 0) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    router.push(`?${params.toString()}`, { scroll: false });
  };

  return { min, max, category, setFilter };
};