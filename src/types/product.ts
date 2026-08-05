

// src/types/product.ts
import { Category } from "./category";

export type SearchableProduct = Product;

export type VariantOptions = Record<string, string>;

export type Variant = {
  id: string;
  _id: string;
  productId: string;
  name: string;
  image?: any;
  barcode: string;
  sku: string;
  selling_price: string;
  condition: string;
  discount_type: string | null;
  discount_percent: string;
  discount_amount: string;
  discount_start_date: string | null;
  discount_end_date: string | null;
  offer_price: string;
  variants_stock: number;
  variants_values: string[] | null;
  total_sold: number;
  isPublish: boolean;
  isPreOrder: boolean;

  // new combination variant fields
  options?: VariantOptions;
  combinationKey?: string;
  
};

export type ProductVariantGroupValue = {
  id: string;
  value: string;
  stock: number;
  extraPrice: number;
};

export type ProductVariantGroup = {
  name: string;
  values: ProductVariantGroupValue[];
};

// export type Product = {
//   id: string;
//   _id?: string;
//   name: string;
//   slug?: string;
//   sku: string;
//   description?: string;
//   short_description?: string;
//   long_description?: string;
//   price?: number;
//   selling_price?: number;
//   discountPrice?: number | null;

//   // base product stock
//   stock?: number;
//   product_stock?: number;

//   // frontend computed stock
//   total_stock?: number;

//   hasVariants?: boolean;
//   isPublish: boolean;
//   categoryId?: string;
//   category?: Category;
//   isFlashDeal?: boolean;
//   flashEndAt?: string | null;

//   flashdeal?: {
//     isFlashDeal: boolean;
//     startAt: string | null;
//     endAt: string | null;
//     offerPrice: number;


//     discountPercent: number;
//   } | null;

//   media?: { type: "image" | "video" | "youtube"; url: string }[];

//   images?: {
//     _id: string;
//     image: {
//       secure_url: string;
//       optimizeUrl: string;
//       public_id: string;
//     };
//     alterImage?: {
//       secure_url: string;
//       optimizeUrl: string;
//       public_id: string;
//     };
//   }[];

//   variantsId?: Variant[];
//   variantGroups?: ProductVariantGroup[];

//   category_group?: {
//     _id: string;
//     name: string;
//   }[];

//   sub_category?: {
//     _id: string;
//     name: string;
//   }[];
// };



export type Product = {
  id: string;
  _id?: string;
  name: string;
  slug?: string;
  sku: string;
 thumbnailUrl?: string | null;
  // ProductCardDto support
  image?: string | null;
  offerPrice?: number;
  stock?: number;

  description?: string;
  short_description?: string;
  long_description?: string;

  price?: number;
  selling_price?: number;
  discountPrice?: number | null;

  product_stock?: number;
  total_stock?: number;

  hasVariants?: boolean;
  isPublish: boolean;

  categoryId?: string;
  category?: Category;

  isFlashDeal?: boolean;
  flashEndAt?: string | null;

  flashdeal?: {
    isFlashDeal: boolean;
    startAt: string | null;
    endAt: string | null;
    offerPrice: number;
    discountPercent: number;
  } | null;

  media?: { type: "image" | "video" | "youtube"; url: string }[];

  images?: {
    _id: string;
    position?: number;
    image: {
      secure_url: string;
      optimizeUrl: string;
      public_id: string;
    };
    alterImage?: {
      secure_url: string;
      optimizeUrl: string;
      public_id: string;
    };
  }[];

  variantsId?: Variant[];
  variantGroups?: ProductVariantGroup[];

  category_group?: {
    _id: string;
    name: string;
  }[];

  sub_category?: {
    _id: string;
    name: string;
  }[];
};


export type ProductsResponse = {
  items: Product[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  priceRange: {
    min: number;
    max: number;
  };
};