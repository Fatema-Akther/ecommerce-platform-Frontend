








"use client";

import { useBusiness } from "@/hooks/useBusiness";
import { formatCurrency } from "@/utils/formatCurrency";
import Link from "next/link";
import {
  FiShoppingCart,
  FiX,
  FiShoppingBag,
  FiArrowRight,
  FiHeart,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiArrowLeft,
} from "react-icons/fi";
import { toast } from "sonner";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSessionStore } from "@/stores/session";
import { Button } from "../ui/Button/cartbutton";
import { Sheet, SheetContent, SheetFooter } from "./Cart";
import { useCart } from "@/features/cart/context/CartContext";
import { CartUiItem } from "@/features/cart/types";

function CartItemComponent({
  item,
  onRemove,
  onQuantityChange,
  onOpenProduct,
}: {
  item: CartUiItem;
  onRemove: () => void;
  onQuantityChange: (q: number) => void | Promise<void>;
  onOpenProduct: () => void;
}) {
  const getImageSrc = (image?: string) => {
    if (!image) return "/assets/placeholder.png";

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    if (image.startsWith("/")) {
      return image;
    }

    const base = process.env.NEXT_PUBLIC_IMAGE_URL?.replace(/\/$/, "") || "";
    return base ? `${base}/${image}` : `/${image}`;
  };

  const src = getImageSrc(item.image);

  return (
    <div
      onClick={onOpenProduct}
      className="flex gap-4 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenProduct();
        }
      }}
    >
      <div className="relative flex-shrink-0 h-24 w-24 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <Image
          src={src}
          alt={item.name}
          fill
          sizes="100px"
          className="object-cover"
          
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 break-words">
            {item.name}
          </h3>

          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="text-red-500 hover:text-red-600 transition-colors"
            aria-label="Remove"
          >
            <FiTrash2 className="w-5 h-5" />
          </button>
        </div>

        {item.variantLabel ? (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {item.variantLabel}
          </p>
        ) : (item.variantValues?.length ?? 0) > 0 ? (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {(item.variantValues ?? []).join(" / ")}
          </p>
        ) : null}

       <div className="mt-2">
  <span className="block text-sm font-medium text-gray-900 dark:text-white">
   {formatCurrency(item.price)}
  </span>

  <div className="mt-2 flex justify-center">
    <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onQuantityChange(item.quantity - 1);
        }}
        disabled={item.quantity <= 1}
        className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FiMinus className="w-3 h-3" />
      </button>

      <span className="w-8 text-center text-sm font-medium text-gray-900 dark:text-white">
        {item.quantity}
      </span>

      <button
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onQuantityChange(item.quantity + 1);
        }}
        disabled={item.quantity >= item.maxStock}
        className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FiPlus className="w-3 h-3" />
      </button>
    </div>
  </div>
</div>
      </div>
    </div>
  );
}

export function CartSheet() {
  const router = useRouter();
  const { businessData } = useBusiness();
  const {
    items,
    itemCount,
    isOpen,
    subtotal,
    discount,
    removeItem,
    closeCart,
    openCart,
    updateItemQuantity,
  } = useCart();

  const accessToken = useSessionStore((s) => s.accessToken);
  const user = useSessionStore((s) => s.user);

  // const currency = businessData?.currency?.[0] || "BDT";
  const currency = "USD";
  const [mounted, setMounted] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [localIsOpen, setLocalIsOpen] = useState(isOpen);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

useEffect(() => {
  setMounted(true);
}, []);

  useEffect(() => {
    setLocalIsOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    if (!localIsOpen) return;

    const handler = (e: MouseEvent) => {
      try {
        const target = e.target as HTMLElement;

        if (
          triggerRef.current &&
          (triggerRef.current === target || triggerRef.current.contains(target))
        ) {
       
          return;
        }

        if (
          wrapperRef.current &&
          (wrapperRef.current === target || wrapperRef.current.contains(target))
        ) {
          return;
        }

       
        closeCart();
        setLocalIsOpen(false);
     } catch {
  closeCart();
  setLocalIsOpen(false);
}
    };

    const timeout = setTimeout(() => {
      window.addEventListener("click", handler);
    }, 100);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("click", handler);
    };
  }, [localIsOpen, closeCart]);

  // const handleRemove = useCallback(
  //   (id: string, variantId: string) => {
  //     removeItem(id, variantId);
  //     toast.success("Item removed from cart", { duration: 700 });
  //   },
  //   [removeItem]
  // );

  // const handleQty = useCallback(
  //   (id: string, variantId: string, q: number) => {
  //     if (q < 1) {
  //       handleRemove(id, variantId);
  //     } else {
  //       updateItemQuantity(id, variantId, q);
  //     }
  //   },
  //   [handleRemove, updateItemQuantity]
  // );


//   const handleQty = useCallback(
//   async (id: string, variantId: string, q: number) => {
//     try {
//       if (q < 1) {
//         handleRemove(id, variantId);
//       } else {
//         await updateItemQuantity(id, variantId, q);
//       }
//     } catch (error: any) {
//       console.error("Quantity update failed:", error);

//       const message =
//         error?.response?.data?.message ||
//         error?.message ||
//         "Failed to update quantity";

//       toast.error(Array.isArray(message) ? message[0] : message, {
//         duration: 2000,
//       });
//     }
//   },
//   [handleRemove, updateItemQuantity]
// );


const handleRemove = useCallback(
  async (id: string, variantId: string) => {
    try {
      await removeItem(id, variantId);
      toast.success("Item removed from cart", { duration: 700 });
    } catch (error: any) {
      
      toast.error(error?.message || "Failed to remove item");
    }
  },
  [removeItem]
);



const handleQty = useCallback(
  async (id: string, variantId: string, q: number) => {
    try {
      if (q < 1) {
        await handleRemove(id, variantId);
      } else {
        await updateItemQuantity(id, variantId, q);
      }
    } catch (error: any) {
    
      toast.error(error?.message || "Failed to update quantity");
    }
  },
  [handleRemove, updateItemQuantity]
);


  const handleOpenProduct = useCallback(
    (item: CartUiItem) => {
      const slug = item.slug;

      if (!slug) {
        toast.error("Product link not found");
        return;
      }

      closeCart();
      setLocalIsOpen(false);
      router.push(`/products/${slug}`);
    },
    [closeCart, router]
  );

  const handleCheckout = useCallback(async () => {
    if (items.length === 0) {
      toast.warning("Your cart is empty", { duration: 2000 });
      return;
    }

    if (!accessToken || !user) {
      toast.info("Please login to continue checkout", { duration: 1200 });

      try {
        closeCart();
        setLocalIsOpen(false);
      } catch {}

      setTimeout(() => {
        router.push("/login?redirect=/checkout");
      }, 700);

      return;
    }

    if (user.role !== "user") {
      alert("Only customer accounts can access checkout.");
      router.replace("/admin");
      return;
    }

    if (isNavigating) return;

    try {
      setIsNavigating(true);
      closeCart();
      setLocalIsOpen(false);

      await new Promise((resolve) => setTimeout(resolve, 300));
      router.push("/checkout");
    } catch (error) {
     
      toast.error("Failed to navigate to checkout. Please try again.", {
        duration: 3000,
      });
      window.location.href = "/checkout";
    } finally {
      setIsNavigating(false);
    }
  }, [items.length, accessToken, user, isNavigating, closeCart, router]);

  const handleOpenCart = useCallback(() => {
  openCart();
  setLocalIsOpen(true);
}, [openCart]);

  const trigger = (
    <button
      ref={triggerRef}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.preventDefault();
        handleOpenCart();
      }}
      className="inline-flex items-center justify-center h-10 w-10 rounded-md text-gray-700 hover:text-gray-500 dark:text-gray-200 transition"
    >
      <div className="relative">
        <FiShoppingCart className="w-6 h-6" />

        {mounted && itemCount > 0 && (
          <span className="absolute -top-3 -right-3 bg-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {itemCount > 9 ? "9+" : itemCount}
          </span>
        )}
      </div>
    </button>
  );

  return (
    <>
      {trigger}

      <Sheet isOpen={localIsOpen || isOpen}>
        <SheetContent className="p-0">
          <div
            ref={wrapperRef}
            className="flex flex-col h-screen sm:max-w-md bg-white dark:bg-gray-900 overflow-hidden"
          >
            <div className="relative px-4 sm:px-6 py-4 sm:py-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary">
                    <FiShoppingBag className="w-5 h-5 text-black" />
                  </div>

                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                      Shopping Cart
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {itemCount} {itemCount === 1 ? "item" : "items"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                  
                    closeCart();
                    setLocalIsOpen(false);
                  }}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <FiX className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-1 md:p-2 space-y-3 sm:space-y-4 mb-48 no-scrollbar">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-6 p-6 sm:p-8">
                  <div className="relative">
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                      <FiShoppingCart className="w-16 h-16 text-gray-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 p-2 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30">
                      <FiHeart className="w-4 h-4 text-blue-500" />
                    </div>
                  </div>

                  <div className="text-center space-y-2">
                    <h3 className="text-lg sm:text-xl font-bold text-black dark:text-white">
                      Your cart is empty
                    </h3>
                    <p className="text-black dark:text-gray-400 max-w-xs text-sm">
                      Discover amazing products and start building your perfect
                      order
                    </p>
                  </div>

                  <div>
                    <Button
                      title="Start Shopping"
                      onClick={() => {
                    
                        closeCart();
                        setLocalIsOpen(false);
                      }}
                      className="bg-[#636356] h-[40px] rounded-xl w-[180px] text-gray-200 dark:text-black"
                    >
                      <Link href="/products" className="flex items-center gap-2">
                        <FiShoppingBag className="w-4 h-4" />
                        Start Shopping
                        <FiArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {items.map((it: CartUiItem) => (
                    <div
                      key={`${it.id}-${it.variantId}`}
                      className="p-1 md:p-2 rounded-2xl bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 shadow-sm"
                    >
                      <CartItemComponent
                        item={it}
                        onRemove={() =>
                          handleRemove(it.id, it.variantId as string)
                        }
                        onQuantityChange={(q) =>
                          handleQty(it.id, it.variantId as string, q)
                        }
                        onOpenProduct={() => handleOpenProduct(it)}
                      />
                    </div>
                  ))}
                </>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-t from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
                <SheetFooter className="p-2 sm:p-2 space-y-2">
                  <div className="space-y-3 p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex justify-between text-sm font-medium text-gray-800 dark:text-gray-200">
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal, currency)}</span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                        <span>Discount</span>
                        <span>-{formatCurrency(discount, currency)}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div>
                      <Button
                        title="Secure Checkout"
                        size="md"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={handleCheckout}
                        disabled={isNavigating || items.length < 1}
                        className="w-full rounded-xl h-[30px] bg-[#eeeed6] dark:bg-[#d2d2c8] hover:bg-[#a7a797]"
                      >
                        <div className="flex w-full text-black items-center justify-center gap-3">
                          <span>Checkout</span>
                          {isNavigating ? (
                            <div className="flex space-x-1">
                              <span className="text-sm text-white">
                                Loading...
                              </span>
                            </div>
                          ) : (
                            <FiArrowRight className="w-4 sm:w-5 h-4 sm:h-5" />
                          )}
                        </div>
                      </Button>
                    </div>

                    <div>
                      <Button
                        title="Continue Shopping"
                        size="sm"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={() => {
                         
                          closeCart();
                          setLocalIsOpen(false);
                        }}
                        className="w-full rounded-xl h-[30px] bg-[#eeeed6] dark:bg-[#d2d2c8] hover:bg-[#a7a797]"
                      >
                        <div className="flex items-center justify-center gap-3 text-black">
                          <FiArrowLeft className="w-4 sm:w-5 h-4 sm:h-5" />
                          <span>Shop More</span>
                        </div>
                      </Button>
                    </div>
                  </div>

                 
                </SheetFooter>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}