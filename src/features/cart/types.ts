export type CartUiItem = {
  id: string;
  productId?: string;
  slug?: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  maxStock: number;
  currency?: string;
  variantId?: string;
  variantLabel?: string;
  variantValues?: string[];
  selectedOptionIds?: string[];
  selectedOptions?: Record<string, string>;
};

export type CartState = {
  items: CartUiItem[];
  subtotal: number;
  total: number;
};