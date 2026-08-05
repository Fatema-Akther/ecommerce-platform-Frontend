"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { BaseAPI } from "@/lib/api/baseApi";
import { useSessionStore } from "@/stores/session";
import { getOrderBadge } from "@/lib/orderBadge";
import Image from "next/image";
import { formatCurrency } from "@/utils/formatCurrency";

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  lineTotal: number;
  imageSnapshot?: string | null;
  nameSnapshot?: string | null;
  variantLabel?: string | null;
  product?: {
    id: string;
    name: string;
    media?: {
      id: string;
      type: string;
      url: string;
      position?: number;
    }[];
  };
};

type Order = {
  id: string;
  status: string;
  reviewStatus?: string;
  fraudFlag?: boolean;
  riskScore?: number;
  total: number;
  paymentMethod: "cod" | "online";
  createdAt: string;
  adminReviewNote?: string | null;
  delivery: {
    fullName: string;
    phone: string;
    address: string;
    city?: string;
    area?: string;
    note?: string;
  };
  riskSignals?: Record<string, any>;
  user?: {
    id: string;
    email?: string;
    fullName?: string;
    role?: string;
  };
  items: OrderItem[];
};

type ReviewAction = "approve" | "reject";

export default function PendingVerificationOrdersPage() {
  const accessToken = useSessionStore((s) => s.accessToken);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [reviewAction, setReviewAction] = useState<ReviewAction>("approve");
  const [reviewNote, setReviewNote] = useState("");

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await BaseAPI.get("/orders/admin/pending-verification", true);
      setOrders((res as Order[]) || []);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to load pending verification orders"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!accessToken) return;
    loadOrders();
  }, [accessToken]);



const DEFAULT_IMAGE = "/assets/placeholder.png";

function getItemImage(item: OrderItem) {
  if (item.imageSnapshot) return item.imageSnapshot;

  const media = item.product?.media ?? [];
  const firstImage = [...media]
    .filter((m) => m.type === "image" && m.url)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))[0];

  return firstImage?.url || DEFAULT_IMAGE;
}

function getItemName(item: OrderItem) {
  return item.nameSnapshot || item.product?.name || "Product";
}





  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return orders;

    return orders.filter((order) => {
      const haystack = [
        order.id,
        order.delivery?.fullName,
        order.delivery?.phone,
        order.delivery?.address,
        order.delivery?.city,
        order.delivery?.area,
        order.user?.email,
        ...(order.items?.map((item) => item.product?.name || "") || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [orders, search]);

 const openReviewModal = (order: Order, action: ReviewAction) => {
  setSelectedOrder(order);
  setReviewAction(action);

  // Reject note optional, তাই শুরুতে খালি থাকবে
  setReviewNote("");
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
        { action: reviewAction, note: reviewNote.trim() || undefined },
        true
      );

      toast.success(
        reviewAction === "approve"
          ? "Order approved successfully"
          : "Order rejected successfully"
      );

      setOrders((prev) => prev.filter((o) => o.id !== selectedOrder.id));
      closeReviewModal();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to review order");
    } finally {
      setActingId(null);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <>
      <div className="p-4 md:p-6">
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-200">Pending Verification Orders</h1>
              <div className="mt-1 text-sm text-gray-900 dark:text-gray-200">
                Total: {orders.length} | Showing: {filteredOrders.length}
              </div>
            </div>

           
          </div>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order, customer, phone, email, product..."
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
          />
        </div>

        {filteredOrders.length === 0 ? (
          <div className="rounded-xl border text-gray-900 dark:text-gray-200 p-6">
            No suspicious orders found.
          </div>
        ) : (
          <div className="space-y-5">
            {filteredOrders.map((order) => {
              const badge = getOrderBadge(order);
const isOpen = !!expanded[order.id];

const riskSignals = order.riskSignals ?? null;
const riskFactors = riskSignals?.riskFactors ?? [];
const riskLevel = riskSignals?.riskLevel ?? "low";
              return (
                <div
                  key={order.id}
                  className="rounded-2xl border bg-white dark:bg-gray-800 p-5 shadow-sm"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="space-y-2 min-w-0">
                      <p className="text-sm text-gray-400 dark:text-gray-200 break-all">
                        Order ID: {order.id}
                      </p>

                      <p className="font-semibold">
                        Customer: {order.delivery.fullName}
                      </p>

                      <p className="text-sm">Phone: {order.delivery.phone}</p>

                      <p className="text-sm break-words">
                        Address: {order.delivery.address}
                        {order.delivery.area ? `, ${order.delivery.area}` : ""}
                        {order.delivery.city ? `, ${order.delivery.city}` : ""}
                      </p>

                      <p className="text-sm">
                        Payment: {order.paymentMethod.toUpperCase()}
                      </p>

                      <p className="text-sm">
                        Total: {formatCurrency(Number(order.total))}
                      </p>

                      <p className="text-sm text-gray-500">
                        Created: {new Date(order.createdAt).toLocaleString()}
                      </p>

                      {order.user?.email ? (
                        <p className="text-sm">User Email: {order.user.email}</p>
                      ) : null}

                      {order.delivery.note ? (
                        <p className="text-sm">
                          <span className="font-medium">Customer Note:</span>{" "}
                          {order.delivery.note}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-col items-start lg:items-end gap-2">

                      <button
  type="button"
  onClick={() =>
    setExpanded((prev) => ({
      ...prev,
      [order.id]: !prev[order.id],
    }))
  }
  className="rounded-lg border px-3 py-1 text-lg font-semibold hover:bg-gray-50"
>
  {isOpen ? "⌃" : "⌄"}
</button>
                      <span className={badge.className}>{badge.label}</span>

                      <span className="text-sm text-gray-500">
                        Status: {order.status}
                      </span>

                      <span className="text-sm text-gray-500">
                        Review: {order.reviewStatus || "clear"}
                      </span>

                      {typeof order.riskScore === "number" ? (
                        <span className="text-sm font-medium text-red-600">
                          Risk Score: {order.riskScore}
                        </span>
                      ) : null}

                      <div className="mt-2 flex flex-col gap-2 min-w-[180px]">
                        <button
                          onClick={() => openReviewModal(order, "approve")}
                          disabled={actingId === order.id}
                          className="rounded-lg bg-green-600 px-4 py-2 text-white disabled:opacity-50"
                        >
                          {actingId === order.id ? "Processing..." : "Approve"}
                        </button>

                        <button
                          onClick={() => openReviewModal(order, "reject")}
                          disabled={actingId === order.id}
                          className="rounded-lg bg-red-600 px-4 py-2 text-white disabled:opacity-50"
                        >
                          {actingId === order.id ? "Processing..." : "Reject"}
                        </button>
                      </div>
                    </div>
                  </div>

                 {isOpen ? (
  <>
    <div className="mt-4">
  <h2 className="mb-2 font-semibold">Items</h2>

  <div className="space-y-3">
    {order.items.map((item) => {
      const imageSrc = getItemImage(item);
      const itemName = getItemName(item);
      const qty = Number(item.quantity || 0);
      const unitPrice = Number(item.price || 0);
      const lineTotal = Number(item.lineTotal || unitPrice * qty);

      return (
        <div
          key={item.id}
          className="flex items-center justify-between gap-3 rounded-lg border bg-white dark:bg-gray-800 p-3 text-sm"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border bg-gray-50">
              <Image
                src={imageSrc}
                alt={itemName}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            <div className="min-w-0">
              <div className="truncate font-medium text-gray-900 dark:text-gray-200">
                {itemName}
              </div>

              {item.variantLabel ? (
                <div className="truncate text-xs text-gray-900 dark:text-gray-200">
                  {item.variantLabel}
                </div>
              ) : null}

              <div className="mt-1 text-xs text-gray-900 dark:text-gray-200">
                Qty: {qty}
              </div>
            </div>
          </div>

          <div className="shrink-0 font-semibold text-gray-900 dark:text-gray-200">
           {formatCurrency(lineTotal)}
          </div>
        </div>
      );
    })}
  </div>
</div>



    {riskSignals ? (
  <div className="mt-4 space-y-3">
    <div className="rounded border bg-yellow-50 dark:bg-gray-800 p-4">
      <div className="flex justify-between gap-3">
        <b>Risk Analysis</b>
        <span className="capitalize">{riskLevel}</span>
      </div>

      <div className="mt-2 grid grid-cols-2 text-sm">
        <div>Score: {order.riskScore ?? 0}</div>
        <div>Status: {order.reviewStatus || "clear"}</div>
      </div>
    </div>

    {riskFactors.length > 0 ? (
      <div className="rounded border bg-white dark:bg-gray-800 p-4">
        <b>Risk Factors</b>

        <ul className="mt-2 space-y-2">
          {riskFactors.map((f: any, i: number) => (
            <li key={i} className="text-sm">
              <b>{f.title}</b> (+{f.points})
              <div>{f.description}</div>
            </li>
          ))}
        </ul>
      </div>
    ) : null}
  </div>
) : null}

    {order.adminReviewNote ? (
      <div className="mt-4 text-sm">
        <span className="font-semibold">Admin Review Note:</span>{" "}
        {order.adminReviewNote}
      </div>
    ) : null}
  </>
) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedOrder ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">
                  {reviewAction === "approve" ? "Approve Order" : "Reject Order"}
                </h2>
                <p className="mt-1 text-sm text-gray-500 break-all">
                  Order ID: {selectedOrder.id}
                </p>
              </div>

              <button
                type="button"
                onClick={closeReviewModal}
                className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <p>
                <span className="font-semibold">Customer:</span>{" "}
                {selectedOrder.delivery.fullName}
              </p>
              <p>
                <span className="font-semibold">Phone:</span>{" "}
                {selectedOrder.delivery.phone}
              </p>
              <p>
                <span className="font-semibold">Total:</span>{" "}
{formatCurrency(selectedOrder.total)}
              </p>
              <p>
                <span className="font-semibold">Payment:</span>{" "}
                {selectedOrder.paymentMethod.toUpperCase()}
              </p>
              <p>
                <span className="font-semibold">Risk Score:</span>{" "}
                {selectedOrder.riskScore ?? 0}
              </p>
            </div>

           {reviewAction === "reject" && (
  <div className="mt-4">
    <label className="mb-2 block text-sm font-medium text-gray-700">
      Rejection Note
      <span className="ml-1 text-xs font-normal text-gray-500">
        (optional)
      </span>
    </label>

    <textarea
      rows={4}
      value={reviewNote}
      onChange={(e) => setReviewNote(e.target.value)}
      className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
      placeholder="Example: Customer information could not be verified."
    />
  </div>
)}

            <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <button
                type="button"
                onClick={closeReviewModal}
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleReview}
                disabled={actingId === selectedOrder.id}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
                  reviewAction === "approve" ? "bg-green-600" : "bg-red-600"
                }`}
              >
                {actingId === selectedOrder.id
                  ? "Processing..."
                  : reviewAction === "approve"
                  ? "Confirm Approve"
                  : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}