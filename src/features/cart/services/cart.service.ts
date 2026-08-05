


import { apiFetch } from "@/lib/api/baseApi";

export type AddToCartPayload = {
  productId: string;
  quantity: number;
  variantId?: string;
  variantLabel?: string;
  image?: string;
  selectedOptionIds?: string[];
  selectedOptions?: Record<string, string>;
};

export const getMyCartApi = async () => {
  return apiFetch("/cart", { method: "GET", auth: true });
};

export const addToCartApi = async (payload: AddToCartPayload) => {
  return apiFetch("/cart/add", {
    method: "POST",
    auth: true,
    body: payload,
  });
};

export const updateCartItemQtyApi = async (
  itemId: string,
  quantity: number
) => {
  return apiFetch(`/cart/item/${itemId}`, {
    method: "PATCH",
    auth: true,
    body: { quantity },
  });
};

export const removeCartItemApi = async (itemId: string) => {
  return apiFetch(`/cart/item/${itemId}`, {
    method: "DELETE",
    auth: true,
  });
};