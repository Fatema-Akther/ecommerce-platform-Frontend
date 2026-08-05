// src/hooks/useCategories.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { PublicAPI } from "@/lib/api/publicApi";

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: PublicAPI.getCategories,
    staleTime: 1000 * 60 * 5,
  });
};