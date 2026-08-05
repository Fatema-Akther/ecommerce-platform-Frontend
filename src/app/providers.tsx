"use client";

import { CartProvider } from "@/features/cart/context/CartContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { Toaster } from "sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        {children}
        <Toaster
          position="top-center"
          richColors
          closeButton
          duration={2000}
        />
      </CartProvider>
    </QueryClientProvider>
  );
}