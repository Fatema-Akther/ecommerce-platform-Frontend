"use client";

import { createContext, useContext } from "react";
import { useCart as useCartHook } from "@/features/cart/hooks/useCart";

const CartContext = createContext<ReturnType<typeof useCartHook> | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const cart = useCartHook();

  return (
    <CartContext.Provider value={cart}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}