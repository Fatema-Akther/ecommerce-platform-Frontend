"use client";

import { useCallback, useEffect, useState } from "react";
import { PublicAPI } from "@/lib/api/publicApi";
import { Category } from "@/types/category";

export type BusinessLogo =
  | string
  | {
      url?: string;
      secure_url?: string;
    }
  | null;

export interface BusinessData {
  categories: Category[];
  currency?: string[];
  businessName?: string | null;
  logo?: BusinessLogo;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  heroBanners?: string[];
}

const defaultBusinessData: BusinessData = {
  categories: [],
  currency: ["USD"],
  businessName: null,
  logo: null,
  email: null,
  phone: null,
  address: null,
  facebookUrl: null,
  instagramUrl: null,
  tiktokUrl: null,
};

async function getBusinessSettings() {
  const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_BASE_URL}/business-settings`,
  {
    method: "GET",
    cache: "no-store",
  }
);

  if (!response.ok) {
    throw new Error("Failed to fetch business settings");
  }

  return response.json();
}

export const useBusiness = () => {
  const [businessData, setBusinessData] =
    useState<BusinessData>(defaultBusinessData);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinessData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [categoriesResult, settingsResult] = await Promise.allSettled([
        PublicAPI.getCategories(),
        getBusinessSettings(),
      ]);

      const categories =
        categoriesResult.status === "fulfilled" &&
        Array.isArray(categoriesResult.value)
          ? categoriesResult.value
          : [];

     const settings =
  settingsResult.status === "fulfilled"
    ? settingsResult.value?.data || settingsResult.value
    : null;

      setBusinessData({
        categories,
        currency: ["USD"],
        businessName: settings?.businessName || null,
        logo: settings?.logo || null,
        email: settings?.email || null,
        phone: settings?.phone || null,
        address: settings?.address || null,
        facebookUrl: settings?.facebookUrl || null,
        instagramUrl: settings?.instagramUrl || null,
        tiktokUrl: settings?.tiktokUrl || null,
   heroBanners: settings?.heroBanners ?? [],
      });
    } catch (err) {
      console.error("Failed to fetch business data", err);
      setBusinessData(defaultBusinessData);
      setError("Failed to fetch business data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBusinessData();
  }, [fetchBusinessData]);

  return {
    businessData,
    loading,
    error,
    refetch: fetchBusinessData,
  };
};