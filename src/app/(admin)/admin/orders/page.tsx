"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { BaseAPI } from "@/lib/api/baseApi";
import { useSessionStore } from "@/stores/session";
import { getOrderBadge } from "@/lib/orderBadge";
import ReviewOrderModal from "@/components/admin/orders/ReviewOrderModal";
import { Order, ReviewAction } from "@/components/admin/orders/types";
import OrderDetailsCard from "@/components/admin/orders/OrderDetailsCard";
import OrderStatusActions from "@/components/admin/orders/OrderStatusActions";
import AdminGuard from "@/components/guards/AdminGuard";
import { useRouter } from "next/navigation";
import { FiRefreshCw } from "react-icons/fi";
import { formatCurrency } from "@/utils/formatCurrency";

const getReviewStatusClass = (reviewStatus?: string) => {
  switch (reviewStatus || "clear") {
    case "clear":
      return "text-green-600 dark:text-green-400";

    case "verified":
      return "text-green-600 dark:text-green-400";

    case "pending_review":
      return "text-amber-600 dark:text-amber-400";

    case "blocked":
      return "text-red-600 dark:text-red-400";

    case "rejected":
      return "text-red-600 dark:text-red-400";

    default:
      return "text-gray-500 dark:text-gray-400";
  }
};

const formatReviewStatus = (reviewStatus?: string) => {
  return (reviewStatus || "clear")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};



export default function AdminOrdersPage() {
  const accessToken = useSessionStore((s) => s.accessToken);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reviewFilter, setReviewFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
   const [dateFilter, setDateFilter] = useState<"all" | "today">("all");
  const [onlySuspicious, setOnlySuspicious] = useState(false);



  // const [expandedId, setExpandedId] = useState<string | null>(null);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [reviewAction, setReviewAction] = useState<ReviewAction>("approve");
  const [actingId, setActingId] = useState<string | null>(null);
 const router = useRouter();



 const PAGE_SIZE = 30;
const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);



  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await BaseAPI.get("/orders/admin/all", true);
      setOrders((res as Order[]) || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };


const isToday = useCallback((dateValue: string) => {
  const date = new Date(dateValue);
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}, []);


useEffect(() => {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);

  const searchParam = params.get("search");
  const statusParam = params.get("status");
  const reviewParam = params.get("review");
  const paymentParam = params.get("payment");
  const dateParam = params.get("date");
  const suspiciousParam = params.get("suspicious");

  if (searchParam) setSearch(searchParam);
  if (statusParam) setStatusFilter(statusParam);
  if (reviewParam) setReviewFilter(reviewParam);
  if (paymentParam) setPaymentFilter(paymentParam);
  if (dateParam === "today") setDateFilter("today");
  if (suspiciousParam === "true") setOnlySuspicious(true);
}, []);




 useEffect(() => {
  if (!accessToken) {
    setLoading(false);
    return;
  }

  loadOrders();
}, [accessToken]);




 const filteredOrders = useMemo(() => {
  const q = search.trim().toLowerCase();

  return orders.filter((order) => {
    const isSuspicious =
      order.status === "pending_verification" ||
      order.reviewStatus === "pending_review" ||
      order.reviewStatus === "blocked" ||
      !!order.fraudFlag ||
      (typeof order.riskScore === "number" && order.riskScore >= 40);

    if (dateFilter === "today" && !isToday(order.createdAt)) return false;
    if (onlySuspicious && !isSuspicious) return false;
    if (statusFilter !== "all" && order.status !== statusFilter) return false;
    if (reviewFilter !== "all" && (order.reviewStatus || "clear") !== reviewFilter)
      return false;
    if (paymentFilter !== "all" && order.paymentMethod !== paymentFilter)
      return false;

    if (!q) return true;

    const haystack = [
      order.id,
      order.status,
      order.reviewStatus || "clear",
      order.paymentMethod,
      order.delivery?.fullName,
      order.delivery?.phone,
      order.delivery?.address,
     
      order.delivery?.city,
        order.delivery?.state,
          order.delivery?.postalCode,
             order.delivery?.country,

     
      order.user?.email,
      ...(order.items?.map((item) => item.product?.name || "") || []),
      ...(order.shipments?.map((shipment) =>
        [
          shipment.trackingNumber,
          shipment.consignmentId,
          shipment.courierStatus,
          shipment.courierProvider?.name,
          shipment.courierProvider?.code,
        ]
          .filter(Boolean)
          .join(" ")
      ) || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(q);
  });
}, [
  orders,
  search,
  statusFilter,
  reviewFilter,
  paymentFilter,
  dateFilter,
  onlySuspicious,
    isToday,
]);

const visibleOrders = useMemo(() => {
  return filteredOrders.slice(0, visibleCount);
}, [filteredOrders, visibleCount]);

const hasMoreOrders = visibleCount < filteredOrders.length;

useEffect(() => {
  setVisibleCount(PAGE_SIZE);
}, [
  search,
  statusFilter,
  reviewFilter,
  paymentFilter,
  dateFilter,
  onlySuspicious,
]);

  const suspiciousCount = useMemo(() => {
    return orders.filter(
      (order) =>
        order.status === "pending_verification" ||
        order.reviewStatus === "pending_review" ||
        order.reviewStatus === "blocked" ||
        !!order.fraudFlag ||
        (typeof order.riskScore === "number" && order.riskScore >= 40)
    ).length;
  }, [orders]);

  const openReviewModal = (order: Order, action: ReviewAction) => {
    setSelectedOrder(order);
    setReviewAction(action);
    setReviewNote(
      action === "approve"
        ? "Approved by admin after review"
        : "Rejected by admin after review"
    );
  };

  const closeReviewModal = () => {
    setSelectedOrder(null);
    setReviewAction("approve");
    setReviewNote("");
  };

  const handleReview = async () => {
    if (!selectedOrder) return;

    try {
      setActingId(selectedOrder.id);

      await BaseAPI.post(
        `/orders/admin/${selectedOrder.id}/review`,
        {
          action: reviewAction,
          note: reviewNote.trim() || undefined,
        },
        true
      );

      toast.success(
        reviewAction === "approve"
          ? "Order approved successfully"
          : "Order rejected successfully"
      );

      await loadOrders();
      closeReviewModal();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to review order");
    } finally {
      setActingId(null);
    }
  };






const updateUrlFilters = (next: {
  search?: string;
  status?: string;
  review?: string;
  payment?: string;
  date?: "all" | "today";
  suspicious?: boolean;
}) => {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);

  const setOrDelete = (key: string, value?: string | boolean) => {
    if (
      value === undefined ||
      value === "" ||
      value === "all" ||
      value === false
    ) {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
  };

  setOrDelete("search", next.search ?? search);
  setOrDelete("status", next.status ?? statusFilter);
  setOrDelete("review", next.review ?? reviewFilter);
  setOrDelete("payment", next.payment ?? paymentFilter);
  setOrDelete("date", next.date ?? dateFilter);
  setOrDelete("suspicious", next.suspicious ?? onlySuspicious);

  const query = params.toString();
  window.history.replaceState(
    null,
    "",
    query ? `/admin/orders?${query}` : "/admin/orders"
  );
};



 const handleDateFilterChange = (value: "all" | "today") => {
  setDateFilter(value);
  updateUrlFilters({ date: value });
};

 const clearFilters = () => {
  setSearch("");
  setStatusFilter("all");
  setReviewFilter("all");
  setPaymentFilter("all");
  setDateFilter("all");
  setOnlySuspicious(false);

  if (typeof window !== "undefined") {
    window.history.replaceState(null, "", "/admin/orders");
  }
};

 

return (
  <AdminGuard>
    {loading ? (
      <div className="p-6">Loading...</div>
    ) : (
      <>
        <div className="p-4 md:p-6">
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">
                {dateFilter === "today" ? "Today's Orders" : "All Orders"}
              </h1>
              <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Total: {orders.length} | Suspicious: {suspiciousCount} | Showing:{" "}
                {visibleOrders.length} of {filteredOrders.length}
              </div>
            </div>

        <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const next = !onlySuspicious;
                  setOnlySuspicious(next);
                  updateUrlFilters({ suspicious: next });
                }}
                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                  onlySuspicious ? "bg-red-600 text-white" : "border hover:bg-gray-50"
                }`}
              >
                {onlySuspicious ? "Showing Suspicious Only" : "Suspicious Only"}
              </button>

              <button
                type="button"
                onClick={clearFilters}
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Clear Filters
              </button>

               <input
      type="text"
      value={search}
      onChange={(e) => {
        setSearch(e.target.value);
        updateUrlFilters({ search: e.target.value });
      }}
      placeholder="orderId/customer/product_Name, email, product..."
      className="block sm:hidden dark:bg-gray-900 w-[340px] md:w-full rounded-xl border px-4 py-3 text-sm outline-none"
    />
            </div>
          </div>

         <div className="overflow-x-auto pb-2">
  <div className="flex gap-3 min-w-max md:grid md:min-w-0 md:grid-cols-2 xl:grid-cols-5">
    <input
      type="text"
      value={search}
      onChange={(e) => {
        setSearch(e.target.value);
        updateUrlFilters({ search: e.target.value });
      }}
      placeholder="orderId/customer/product_Name, email, product..."
      className="hidden sm:block dark:bg-gray-600 w-[260px] md:w-full rounded-xl border px-4 py-3 text-sm outline-none"
    />

    <select
      value={statusFilter}
      onChange={(e) => {
        setStatusFilter(e.target.value);
        updateUrlFilters({ status: e.target.value });
      }}
      className="w-[160px] md:w-full rounded-xl border px-4 py-3 text-sm outline-none bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200"
    >
      <option value="all">All Status</option>
      {/* <option value="pending">pending</option>
      <option value="pending_verification">pending_verification</option>
      <option value="awaiting_payment">awaiting_payment</option>
      <option value="paid">paid</option> */}
      <option value="processing">processing</option>
      <option value="shipped">shipped</option>
      <option value="delivered">delivered</option>
      <option value="completed">completed</option>
      <option value="refunded">refunded</option>
      <option value="failed">failed</option>
      <option value="cancelled">cancelled</option>
    </select>

    <select
      value={reviewFilter}
      onChange={(e) => {
        setReviewFilter(e.target.value);
        updateUrlFilters({ review: e.target.value });
      }}
      className="w-[180px] md:w-full rounded-xl border px-4 py-3 text-sm outline-none bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200"
    >
      <option value="all">All Review</option>
      <option value="clear">clear</option>
      <option value="pending_review">pending_review</option>
      <option value="blocked">blocked</option>
      <option value="verified">verified</option>
      <option value="rejected">rejected</option>
    </select>

   <select
  value={paymentFilter}
  onChange={(e) => {
    setPaymentFilter(e.target.value);
    updateUrlFilters({ payment: e.target.value });
  }}
>
  <option value="all">All Payment</option>
  <option value="cod">cod</option>
  <option value="stripe">stripe</option>
</select>

    <select
      value={dateFilter}
      onChange={(e) =>
        handleDateFilterChange(e.target.value as "all" | "today")
      }
      className="w-[180px] md:w-full rounded-xl border px-4 py-3 text-sm outline-none bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200"
    >
      <option value="all">All Dates</option>
      <option value="today">Today</option>
    </select>
  </div>
</div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="rounded-xl border bg-white text-black dark:text-white p-6">
            No orders found.
          </div>
        ) : (
          <>
            {/* ── DESKTOP TABLE (md এবং তার উপরে) ── */}
            <div className="hidden md:block overflow-hidden rounded-2xl border bg-white dark:bg-gray-800">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-600">
                    <tr className="text-left text-gray-600">
                      <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">Order</th>
                      <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">Customer</th>
                      <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">Phone</th>
                      <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">Payment</th>
                      <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">Total</th>
                      <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">Badge</th>
                      <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">Status</th>
                      <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">Risk</th>
                      <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">Created</th>
                      <th className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {visibleOrders.map((order) => {
                      const badge = getOrderBadge(order);
                      const isReviewable = order.status === "pending_verification";

                      return (
                        <Fragment key={order.id}>
                          <tr className="border-t align-top">
                            <td className="px-4 py-3">
                              <div className="max-w-[180px] break-all">{order.id}</div>
                            </td>

                            <td className="px-4 py-3">
                              <div>{order.delivery.fullName}</div>
                              {order.user?.email ? (
                                <div className="text-xs text-gray-500 mt-1">
                                  {order.user.email}
                                </div>
                              ) : null}
                            </td>

                            <td className="px-4 py-3">{order.delivery.phone}</td>

                            <td className="px-4 py-3 uppercase">{order.paymentMethod}</td>

                            <td className="px-4 py-3">
                             {formatCurrency(Number(order.total))}
                            </td>

                            <td className="px-4 py-3">
                              <span className={badge.className}>{badge.label}</span>
                            </td>

                            <td className="px-4 py-3">
                              <div>{order.status}</div>
                              <div
  className={`mt-1 text-xs font-semibold ${getReviewStatusClass(
    order.reviewStatus
  )}`}
>
  {formatReviewStatus(order.reviewStatus)}
</div>
                            </td>

                            <td className="px-4 py-3 text-red-600 font-medium">
                              {order.riskScore ?? 0}
                            </td>

                            <td className="px-4 py-3 whitespace-nowrap">
                              {new Date(order.createdAt).toLocaleString()}
                            </td>

                            <td className="px-4 py-3">
                              <div className="flex flex-col gap-2 min-w-[140px]">
                                <button
                                  onClick={() => {
                                    const query =
                                      typeof window !== "undefined"
                                        ? window.location.search
                                        : "";
                                    router.push(`/admin/orders/${order.id}${query}`);
                                  }}
                                  className="rounded-lg border px-3 py-2 text-xs hover:bg-gray-50"
                                >
                                  View
                                </button>

                                {isReviewable ? (
                                  <></>
                                ) : (
                                  <OrderStatusActions
                                    order={order}
                                    onUpdated={(updatedOrder) => {
                                      setOrders((prev) =>
                                        prev.map((o) =>
                                          o.id === updatedOrder.id ? updatedOrder : o
                                        )
                                      );
                                    }}
                                  />
                                )}
                              </div>
                            </td>
                          </tr>
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {hasMoreOrders ? (
                <div className="flex justify-center border-t bg-white p-2 dark:bg-gray-800">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                    className="inline-flex items-center gap-3 rounded-2xl border border-gray-300 bg-white px-4 py-2 text-base font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 active:scale-[0.98] dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-700"
                  >
                    <FiRefreshCw className="text-lg" />
                    <span>Load more</span>
                    <span className="inline-flex min-w-[34px] items-center justify-center rounded-full border border-gray-300 bg-gray-50 px-2.5 py-0.5 text-sm font-semibold text-gray-700 dark:border-gray-500 dark:bg-gray-800 dark:text-gray-200">
                      {PAGE_SIZE}
                    </span>
                  </button>
                </div>
              ) : filteredOrders.length > PAGE_SIZE ? (
                <div className="flex items-center justify-center gap-2.5 border-t border-gray-100 bg-white px-4 py-4 dark:border-white/[0.06] dark:bg-gray-800">
                  <span className="h-px w-12 bg-gray-100 dark:bg-white/10" />
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-200 dark:bg-white/20" />
                  <span className="text-[11px] font-medium tracking-wide text-gray-400 dark:text-gray-500">
                    All orders loaded
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-200 dark:bg-white/20" />
                  <span className="h-px w-12 bg-gray-100 dark:bg-white/10" />
                </div>
              ) : null}
            </div>

           {/* ── MOBILE CARD LIST (শুধু md-এর নিচে) ── */}
<div className="flex md:hidden flex-col gap-3">
  {visibleOrders.map((order) => {
    const badge = getOrderBadge(order);
    const isReviewable = order.status === "pending_verification";

    return (
      <div
        key={order.id}
        className="rounded-2xl border bg-white dark:bg-gray-800 p-4 shadow-sm"
      >
        {/* Order ID + Badge */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-0.5">
              Order ID
            </p>
            <p className="text-xs font-mono font-medium text-gray-800 dark:text-gray-200 break-all">
              {order.id}
            </p>
          </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
    <span className={`${badge.className}`}>
      {badge.label}
    </span>

    <span className="text-[11px] text-gray-400 dark:text-gray-600 whitespace-nowrap">
      {new Date(order.createdAt).toLocaleString()}
    </span>
  </div>

         
        </div>

        {/* Name */}
        <div className="mb-3">
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-0.5">
            Name
          </p>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
            {order.delivery.fullName}
          </p>
        </div>

      

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={() => {
              const query =
                typeof window !== "undefined" ? window.location.search : "";
              router.push(`/admin/orders/${order.id}${query}`);
            }}
            className="w-full rounded-lg border px-3 py-2 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
          >
            View
          </button>

          {!isReviewable && (
            <OrderStatusActions
              order={order}
              onUpdated={(updatedOrder) => {
                setOrders((prev) =>
                  prev.map((o) =>
                    o.id === updatedOrder.id ? updatedOrder : o
                  )
                );
              }}
            />
          )}
        </div>
      </div>
    );
  })}

  {/* Load more / All loaded — mobile */}
  {hasMoreOrders ? (
    <div className="flex justify-center pt-1">
      <button
        type="button"
        onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
        className="inline-flex items-center gap-3 rounded-2xl border border-gray-300 bg-white px-4 py-2 text-base font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 active:scale-[0.98] dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-700"
      >
        <FiRefreshCw className="text-lg" />
        <span>Load more</span>
        <span className="inline-flex min-w-[34px] items-center justify-center rounded-full border border-gray-300 bg-gray-50 px-2.5 py-0.5 text-sm font-semibold text-gray-700 dark:border-gray-500 dark:bg-gray-800 dark:text-gray-200">
          {PAGE_SIZE}
        </span>
      </button>
    </div>
  ) : filteredOrders.length > PAGE_SIZE ? (
    <div className="flex items-center justify-center gap-2.5 px-4 py-4">
      <span className="h-px w-12 bg-gray-100 dark:bg-white/10" />
      <span className="h-1.5 w-1.5 rounded-full bg-gray-200 dark:bg-white/20" />
      <span className="text-[11px] font-medium tracking-wide text-gray-400 dark:text-gray-500">
        All orders loaded
      </span>
      <span className="h-1.5 w-1.5 rounded-full bg-gray-200 dark:bg-white/20" />
      <span className="h-px w-12 bg-gray-100 dark:bg-white/10" />
    </div>
  ) : null}
</div>
          </>
        )}
      </div>
     </>
  )}
</AdminGuard>
);
}