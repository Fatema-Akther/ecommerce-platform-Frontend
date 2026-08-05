"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { OrderAPI } from "@/lib/api/orderApi";
import { Order, OrderItem } from "@/components/admin/orders/types";
import { formatCurrency } from "@/utils/formatCurrency";
import { toast } from "sonner";
import { BaseAPI } from "@/lib/api/baseApi";

type Props = {
  userId?: string;
};



type StripeCheckoutResponse = {
  paymentId: string;
  provider: "stripe";
  status: string;
  checkoutSessionId: string;
  checkoutUrl: string | null;
  mock: boolean;
  note?: string;
};

const DEFAULT_IMAGE = "/assets/placeholder.png";

const getImageSrc = (image?: string) => {
  if (!image || !image.trim()) return DEFAULT_IMAGE;

  const cleanImage = image.trim().replace(/\\/g, "/").replace(/^\.?\//, "");

  if (
    cleanImage.startsWith("http://") ||
    cleanImage.startsWith("https://") ||
    cleanImage.startsWith("data:")
  ) {
    return cleanImage;
  }

  if (image.trim().startsWith("/")) {
    return image.trim().replace(/\\/g, "/");
  }

  const base = process.env.NEXT_PUBLIC_IMAGE_URL?.replace(/\/$/, "") || "";
  return base ? `${base}/${cleanImage}` : `/${cleanImage}`;
};

const pickImageValue = (value: unknown): string | undefined => {
  if (typeof value === "string" && value.trim()) return value.trim();

  if (Array.isArray(value) && value.length > 0) {
    return pickImageValue(value[0]);
  }

  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;

    const src =
      obj.secure_url ||
      obj.url ||
      obj.src ||
      obj.path ||
      obj.image ||
      obj.thumbnail;

    if (typeof src === "string" && src.trim()) return src.trim();
  }

  return undefined;
};

const getOrderItemName = (item: OrderItem | undefined) => {
  const anyItem = item as any;

  return (
    anyItem?.nameSnapshot ||
    anyItem?.product?.name ||
    anyItem?.name ||
    "Product Name"
  );
};

const getOrderItemImage = (item: OrderItem | undefined) => {
  const anyItem = item as any;

  const rawImage =
    pickImageValue(anyItem?.imageSnapshot) ??
    pickImageValue(anyItem?.product?.image) ??
    pickImageValue(anyItem?.image) ??
    pickImageValue(anyItem?.product?.images) ??
    pickImageValue(anyItem?.product?.thumbnail) ??
    pickImageValue(anyItem?.product?.media) ??
    pickImageValue(anyItem?.variant?.image) ??
    pickImageValue(anyItem?.variant?.images);

  return getImageSrc(rawImage);
};

const getOrderItemSlug = (item: OrderItem | undefined) => {
  const anyItem = item as any;

  return (
    anyItem?.product?.slug ||
    anyItem?.productSnapshot?.slug ||
    anyItem?.slug ||
    ""
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending_verification":
      return "bg-yellow-100 text-yellow-600";
    case "pending":
      return "bg-gray-100 text-yellow-700";
    case "awaiting_payment":
      return "bg-blue-100 text-blue-600";
    case "processing":
      return "bg-green-100 text-green-700";
    case "shipped":
      return "bg-blue-100 text-green-600";
    case "delivered":
      return "bg-blue-200 text-blue-400";
    case "completed":
      return "bg-green-100 text-green-600";
    case "refunded":
      return "bg-red-300 text-red-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-white text-gray-700";
  }
};

const getPrimaryShipment = (order: Order) => {
  return order.shipments?.[0];
};

const formatCourierStatus = (status?: string | null) => {
  if (!status) return "Not Assigned";
  return status.replace(/_/g, " ");
};

export default function CustomerOrdersTab({ userId }: Props) {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [visibleOrderCount, setVisibleOrderCount] = useState(20);
  const [selectedOrderStatus, setSelectedOrderStatus] = useState("all");

  const [expandedOrderIds, setExpandedOrderIds] = useState<Set<string>>(
  new Set()
);

const [payingOrderId, setPayingOrderId] =
  useState<string | null>(null);



const toggleOrderItems = (orderId: string) => {
  setExpandedOrderIds((prev) => {
    const next = new Set(prev);

    if (next.has(orderId)) {
      next.delete(orderId);
    } else {
      next.add(orderId);
    }

    return next;
  });
};

const handleStripePayNow = async (order: Order) => {
  if (
    order.paymentMethod !== "stripe" ||
    order.status !== "awaiting_payment"
  ) {
    toast.error("This order is not ready for Stripe payment");
    return;
  }

  try {
    setPayingOrderId(order.id);

    const stripeSession =
      await BaseAPI.post<StripeCheckoutResponse>(
        `/payments/stripe/checkout-session/${order.id}`,
        {},
        true,
      );

    if (!stripeSession?.paymentId) {
      throw new Error(
        "Stripe payment could not be initialized",
      );
    }

    if (stripeSession.mock) {
      const autoComplete =
        process.env
          .NEXT_PUBLIC_STRIPE_MOCK_AUTO_COMPLETE ===
        "true";

      if (!autoComplete) {
        console.log(
          "Stripe mock payment ID:",
          stripeSession.paymentId,
        );

        toast.info(
          "Mock session created. Complete or expire it manually.",
        );

        return;
      }

      await BaseAPI.post(
        `/payments/stripe/mock/complete/${stripeSession.paymentId}`,
        {},
        true,
      );

      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder.id === order.id
            ? {
                ...currentOrder,
                status: "paid",
                paymentProvider: "stripe",
              }
            : currentOrder,
        ),
      );

      toast.success(
        "Stripe mock payment completed successfully",
      );

      return;
    }

    if (!stripeSession.checkoutUrl) {
      throw new Error(
        "Stripe Checkout URL was not returned",
      );
    }

    window.location.assign(
      stripeSession.checkoutUrl,
    );
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to start Stripe payment";

    toast.error(
      Array.isArray(message)
        ? message[0]
        : message,
    );
  } finally {
    setPayingOrderId(null);
  }
};



  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);

        const userOrders = await OrderAPI.getMyOrders();

        if (!cancelled) {
          setOrders(Array.isArray(userOrders) ? userOrders : []);
          setVisibleOrderCount(20);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);

        if (!cancelled) {
          setOrders([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingOrders(false);
        }
      }
    };

    fetchOrders();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const orderStatusCounts = useMemo(() => {
    return orders.reduce<Record<string, number>>((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});
  }, [orders]);

  const orderStatusTabs = [
    { key: "all", label: "All Order", count: orders.length },
    { key: "pending", label: "Pending", count: orderStatusCounts.pending || 0 },
    {
      key: "processing",
      label: "Processing",
      count: orderStatusCounts.processing || 0,
    },
    { key: "shipped", label: "Shipped", count: orderStatusCounts.shipped || 0 },
    {
      key: "completed",
      label: "Completed",
      count: orderStatusCounts.completed || 0,
    },
    {
      key: "cancelled",
      label: "Cancelled",
      count: orderStatusCounts.cancelled || 0,
    },
  ];

  const filteredOrders =
    selectedOrderStatus === "all"
      ? orders
      : orders.filter((order) => order.status === selectedOrderStatus);

  const visibleOrders = filteredOrders.slice(0, visibleOrderCount);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
          All Orders
        </h1>

        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
          Check all orders at single place.
        </p>

        <div className="mt-5 flex gap-4 overflow-x-auto border-b border-gray-200 dark:border-gray-300 scrollbar-hide">
          {orderStatusTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setSelectedOrderStatus(tab.key);
                setVisibleOrderCount(20);
              }}
              className={`whitespace-nowrap pb-3 text-sm font-semibold transition ${
                selectedOrderStatus === tab.key
                  ? "border-b-2 border-orange-500 dark:border-orange-200 text-gray-900 dark:text-white"
                  : "text-gray-700 dark:text-gray-300 hover:text-gray-900"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {loadingOrders ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-gray-500">
          Loading orders...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-gray-500">
          No orders found yet.
        </div>
      ) : (
        <div className="space-y-6">
        {visibleOrders.map((order) => {
  const statusColor = getStatusColor(order.status);
  const shipment = getPrimaryShipment(order);

  const orderItems = Array.isArray(order.items) ? order.items : [];
  const firstItem = orderItems[0];
  const extraItems = orderItems.slice(1);

  const hasMoreItems = extraItems.length > 0;
  const isExpanded = expandedOrderIds.has(order.id);

  return (
    <div
      key={order.id}
      className="overflow-hidden rounded-lg border bg-white transition hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
    >
      {/* প্রথম product সবসময় দেখাবে */}
      <div className="flex items-start justify-between gap-3 p-3 md:p-4">
        <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-4">
          <button
            type="button"
            className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100 md:h-16 md:w-16"
            onClick={() => {
              const slug = getOrderItemSlug(firstItem);
              if (!slug) return;

              router.push(`/products/${slug}`);
            }}
          >
            <img
              src={getOrderItemImage(firstItem)}
              alt={getOrderItemName(firstItem)}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = DEFAULT_IMAGE;
              }}
            />
          </button>

          <div className="min-w-0 flex-1">
            <p className="line-clamp-1 text-sm font-medium text-gray-900 dark:text-gray-200 md:text-base">
              {getOrderItemName(firstItem)}
            </p>

           <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-300">
  {formatCurrency(
    Number((firstItem as any)?.price ?? 0) *
      Number((firstItem as any)?.quantity ?? 1),
  )}
</p>

            <p className="mt-1 text-xs text-gray-700 dark:text-gray-300">
              Qty: {Number((firstItem as any)?.quantity ?? 1)}
            </p>

            {(firstItem as any)?.variantLabel && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {(firstItem as any).variantLabel}
              </p>
            )}

            {/* একের বেশি product থাকলে See more button */}
            {hasMoreItems && (
              <button
                type="button"
                onClick={() => toggleOrderItems(order.id)}
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#cd4d11] hover:underline"
              >
                {isExpanded
                  ? "Hide extra items"
                  : `See ${extraItems.length} more item${
                      extraItems.length > 1 ? "s" : ""
                    }`}
                <span>{isExpanded ? "⌃" : "⌄"}</span>
              </button>
            )}
          </div>
        </div>

        <div
          className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold md:px-3 md:text-sm ${statusColor}`}
        >
          {order.status}
        </div>
      </div>

      {/* Dropdown: দ্বিতীয় product থেকে সব বাকি product */}
      {isExpanded && hasMoreItems && (
        <div className="border-t border-gray-200 bg-gray-50 px-3 py-3 dark:border-gray-700 dark:bg-gray-800 md:px-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Other items in this order
          </p>

          <div className="space-y-3">
            {extraItems.map((item: OrderItem, index: number) => (
              <div
                key={(item as any)?.id ?? `${order.id}-item-${index}`}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900"
              >
                <button
                  type="button"
                  className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-gray-100"
                  onClick={() => {
                    const slug = getOrderItemSlug(item);
                    if (!slug) return;

                    router.push(`/products/${slug}`);
                  }}
                >
                  <img
                    src={getOrderItemImage(item)}
                    alt={getOrderItemName(item)}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = DEFAULT_IMAGE;
                    }}
                  />
                </button>

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium text-gray-900 dark:text-gray-200">
                    {getOrderItemName(item)}
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-300">
  {formatCurrency(
    Number((item as any)?.price ?? 0) *
      Number((item as any)?.quantity ?? 1),
  )}
</p>

                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Qty: {Number((item as any)?.quantity ?? 1)}
                  </p>

                  {(item as any)?.variantLabel && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {(item as any).variantLabel}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Failed order note */}
      {order.status === "failed" && order.adminReviewNote && (
        <div className="px-3 py-3 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400 md:px-4">
          <strong>Admin&apos;s Review Note:</strong> {order.adminReviewNote}
        </div>
      )}


      {order.paymentMethod === "stripe" &&
  order.status === "awaiting_payment" && (
    <div className="border-t border-gray-200 px-3 py-3 dark:border-gray-700 md:px-4">
      <div className="flex flex-col gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            Payment Pending
          </p>

          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            Your order has been approved. Complete
            the payment to continue processing.
          </p>

          <p className="mt-2 text-sm font-bold text-gray-900 dark:text-white">
            Payable amount:{" "}
            {formatCurrency(Number(order.total))}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            handleStripePayNow(order)
          }
          disabled={payingOrderId === order.id}
          className="inline-flex min-w-28 items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {payingOrderId === order.id
            ? "Opening..."
            : "Pay Now"}
        </button>
      </div>
    </div>
  )}

      {/* Courier details */}
      {shipment?.courierProvider && (
        <div className="border-t border-gray-200 px-3 py-3 text-xs text-gray-700 dark:border-gray-700 dark:text-gray-300 md:px-4">
          <p>
            Courier:{" "}
            <span className="font-medium">
              {shipment.courierProvider.name}
            </span>
          </p>

          <p className="mt-1">
            Status:{" "}
            <span className="font-medium">
              {formatCourierStatus(shipment.courierStatus)}
            </span>
          </p>

          {shipment.trackingNumber && (
            <p className="mt-1">
              Tracking:{" "}
              <span className="font-medium">
                {shipment.trackingNumber}
              </span>
            </p>
          )}

          {shipment.trackingUrl && (
            <button
              type="button"
              onClick={() => {
                window.open(
                  shipment.trackingUrl || "",
                  "_blank",
                  "noopener,noreferrer"
                );
              }}
              className="mt-2 rounded-lg border px-3 py-1 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Track Parcel
            </button>
          )}
        </div>
      )}
    </div>
  );
})}



          {visibleOrderCount < filteredOrders.length && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => setVisibleOrderCount((prev) => prev + 20)}
                className="rounded-lg bg-gray-700 px-6 py-2 text-sm font-semibold text-white hover:bg-gray-800"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}