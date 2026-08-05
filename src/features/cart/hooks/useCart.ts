
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSessionStore } from "@/stores/session";
import {
  addToCartApi,
  getMyCartApi,
  removeCartItemApi,
  updateCartItemQtyApi,
} from "../services/cart.service";
import { calcSubtotal, mapBackendCartToUi } from "../utils/cartMapper";
import { CartUiItem } from "../types";
import { toast } from "sonner";

const GUEST_CART_KEY = "guest_cart_v1";

const getGuestCart = (): CartUiItem[] => {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const setGuestCart = (items: CartUiItem[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
};

const clearGuestCart = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GUEST_CART_KEY);
};

const isLoggedIn = () => {
  const { accessToken, user } = useSessionStore.getState();
  return !!accessToken && !!user;
};

const normalizeOptionIds = (ids?: string[]) => {
  return [...(ids ?? [])].filter(Boolean).sort();
};

const normalizeSelectedOptions = (options?: Record<string, string>) => {
  if (!options) return {};

  return Object.keys(options)
    .sort()
    .reduce<Record<string, string>>((acc, key) => {
      const value = options[key];
      if (value) acc[key] = value;
      return acc;
    }, {});
};

const isSameCartConfig = (
  a: {
    productId?: string;
    variantId?: string;
    selectedOptionIds?: string[];
    selectedOptions?: Record<string, string>;
    variantLabel?: string;
  },
  b: {
    productId?: string;
    variantId?: string;
    selectedOptionIds?: string[];
    selectedOptions?: Record<string, string>;
    variantLabel?: string;
  }
) => {
  if ((a.productId || "") !== (b.productId || "")) return false;
  if ((a.variantId || "") !== (b.variantId || "")) return false;

  const aIds = JSON.stringify(normalizeOptionIds(a.selectedOptionIds));
  const bIds = JSON.stringify(normalizeOptionIds(b.selectedOptionIds));

  if (aIds !== bIds) return false;

  const aOptions = JSON.stringify(normalizeSelectedOptions(a.selectedOptions));
  const bOptions = JSON.stringify(normalizeSelectedOptions(b.selectedOptions));

  if (aOptions !== bOptions) return false;

  if ((a.variantLabel || "") !== (b.variantLabel || "")) return false;

  return true;
};

export const useCart = () => {
  const hydrated = useSessionStore((s) => s.hydrated);

  const [items, setItems] = useState<CartUiItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadCart = async () => {
    setLoading(true);

    try {
      const { accessToken, user } = useSessionStore.getState();

      if (accessToken && user) {
        const backendCart = await getMyCartApi();
        setItems(mapBackendCartToUi(backendCart));
      } else {
        setItems(getGuestCart());
      }
    } catch (error: any) {
      if (error?.message !== "Unauthorized") {
        console.error("Failed to load cart:", error);
      }
      setItems(getGuestCart());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hydrated) return;
    loadCart();
  }, [hydrated]);

  const addItem = async (item: {
    productId: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    maxStock: number;
    currency?: string;
    variantId?: string;
    variantLabel?: string;
    variantValues?: string[];
    selectedOptionIds?: string[];
    selectedOptions?: Record<string, string>;
    slug?: string;
  }) => {
    if (isLoggedIn()) {
      try {
        await addToCartApi({
          productId: item.productId,
          quantity: item.quantity,
          variantId: item.variantId,
          variantLabel: item.variantLabel,
          image: item.image,
          selectedOptionIds: item.selectedOptionIds,
          selectedOptions: item.selectedOptions,
        });

        const backendCart = await getMyCartApi();
        setItems(mapBackendCartToUi(backendCart));
        return;
      } catch (error: any) {
        throw new Error(
          error?.response?.data?.message ||
            error?.message ||
            "Could not add item to cart"
        );
      }
    }

    const guestItems = getGuestCart();

    const existing = guestItems.find((p) =>
      isSameCartConfig(p, {
        productId: item.productId,
        variantId: item.variantId,
        selectedOptionIds: item.selectedOptionIds,
        selectedOptions: item.selectedOptions,
        variantLabel: item.variantLabel,
      })
    );

    let next: CartUiItem[];

    if (existing) {
      next = guestItems.map((p) =>
        isSameCartConfig(p, {
          productId: item.productId,
          variantId: item.variantId,
          selectedOptionIds: item.selectedOptionIds,
          selectedOptions: item.selectedOptions,
          variantLabel: item.variantLabel,
        })
          ? {
              ...p,
              quantity: Math.min(p.quantity + item.quantity, p.maxStock),
            }
          : p
      );
    } else {
      next = [
        ...guestItems,
        {
          id: crypto.randomUUID(),
          productId: item.productId,
          slug: item.slug,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: Math.min(item.quantity, item.maxStock),
          maxStock: item.maxStock,
          currency: item.currency,
          variantId: item.variantId,
          variantLabel: item.variantLabel,
          variantValues: item.variantValues,
          selectedOptionIds: normalizeOptionIds(item.selectedOptionIds),
          selectedOptions: normalizeSelectedOptions(item.selectedOptions),
        },
      ];
    }

    setGuestCart(next);
    setItems(next);
  };

  const removeItem = async (id: string, variantId?: string) => {
    if (isLoggedIn()) {
      try {
        await removeCartItemApi(id);
        const backendCart = await getMyCartApi();
        setItems(mapBackendCartToUi(backendCart));
        return;
      } catch (error: any) {
        throw new Error(
          error?.response?.data?.message ||
            error?.message ||
            "Could not remove cart item"
        );
      }
    }

    const next = getGuestCart().filter(
      (item) =>
        !(
          item.id === id &&
          (item.variantId || "") === (variantId || "")
        )
    );

    setGuestCart(next);
    setItems(next);
  };

  const updateItemQuantity = async (
    id: string,
    variantId: string | undefined,
    quantity: number
  ) => {
    const target = items.find(
      (item) =>
        item.id === id && (item.variantId || "") === (variantId || "")
    );

    if (!target) return;

    if (quantity < 1) return;

    if (quantity > target.maxStock) {
      toast.error(`Only ${target.maxStock} item(s) available`);
      return;
    }

    if (isLoggedIn()) {
      const previousItems = [...items];

      setItems((prev) =>
        prev.map((item) =>
          item.id === id && (item.variantId || "") === (variantId || "")
            ? { ...item, quantity }
            : item
        )
      );

      try {
        await updateCartItemQtyApi(id, quantity);
        const backendCart = await getMyCartApi();
        setItems(mapBackendCartToUi(backendCart));
        return;
      } catch (error: any) {
        setItems(previousItems);

        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Could not update cart item";

        toast.error(Array.isArray(message) ? message[0] : message);
        return;
      }
    }

    const next = getGuestCart().map((item) =>
      item.id === id && (item.variantId || "") === (variantId || "")
        ? {
            ...item,
            quantity: Math.max(1, Math.min(quantity, item.maxStock)),
          }
        : item
    );

    setGuestCart(next);
    setItems(next);
  };

  const mergeGuestCartToBackend = async () => {
    if (!isLoggedIn()) return;

    const guestItems = getGuestCart();
    if (!guestItems.length) return;

    try {
      for (const item of guestItems) {
        await addToCartApi({
          productId: item.productId!,
          quantity: item.quantity,
          variantId: item.variantId,
          variantLabel: item.variantLabel,
          image: item.image,
          selectedOptionIds: item.selectedOptionIds,
          selectedOptions: item.selectedOptions,
        });
      }

      clearGuestCart();

      const backendCart = await getMyCartApi();
      setItems(mapBackendCartToUi(backendCart));
    } catch (error) {
      console.error("Failed to merge guest cart to backend:", error);
    }
  };

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

const itemCount = useMemo(
  () =>
    items.reduce((sum, item) => {
      const qty = Number(item.quantity ?? 0);
      return sum + (Number.isFinite(qty) ? qty : 0);
    }, 0),
  [items]
);

  const subtotal = useMemo(() => calcSubtotal(items), [items]);

  const discount = 0;

  return {
    items,
    itemCount,
    isOpen,
    subtotal,
    discount,
    loading,
    addItem,
    removeItem,
    updateItemQuantity,
    openCart,
    closeCart,
    loadCart,
    mergeGuestCartToBackend,
  };
};