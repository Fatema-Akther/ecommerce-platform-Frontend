


import { CartUiItem } from "../types";

export const mapBackendCartToUi = (cart: any): CartUiItem[] => {
  if (!cart?.items) return [];

  return cart.items.map((item: any) => {
    return {
      id: item.id,
      productId: item.productId,

      name: item.name || "Unnamed Product",

      image: item.image || "/assets/placeholder.png",

      price: Number(item.price ?? 0),

      quantity: Number(item.quantity ?? 0),

      maxStock: 999,

       currency: "USD",

      variantId: item.variantId ?? null,
      variantLabel: item.variant?.label ?? undefined,
      variantValues: item.variant?.label ? [item.variant.label] : [],
    };
  });
};

export const calcSubtotal = (items: CartUiItem[]) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);