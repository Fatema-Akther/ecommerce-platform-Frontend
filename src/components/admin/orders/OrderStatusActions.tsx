



"use client";

import { useState } from "react";
import { toast } from "sonner";

import { OrderAPI } from "@/lib/api/orderApi";
import { Order, OrderStatus } from "./types";

type ActionStatus =
  | "processing"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled"
  | "refunded";

type Props = {
  order: Order;
  onUpdated?: (updatedOrder: Order) => void;
};

export default function OrderStatusActions({ order, onUpdated }: Props) {
  const [loading, setLoading] = useState(false);

  const updateStatus = async (nextStatus: ActionStatus) => {
    try {
      setLoading(true);

      const noteMap: Record<ActionStatus, string> = {
        processing: "Order marked as processing",
        shipped: "Order marked as shipped",
        delivered: "Order marked as delivered",
        completed: "Order marked as completed",
        cancelled: "Order cancelled by admin",
        refunded: "Order refunded by admin",
      };

      const updated = await OrderAPI.updateOrderStatus(
        order.id,
        nextStatus,
        noteMap[nextStatus]
      );

      toast.success(`Order updated to ${nextStatus}`);
      onUpdated?.(updated);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update order status";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  const status = order.status;

  const allowedMap: Record<OrderStatus, ActionStatus[]> = {
    pending: ["processing", "cancelled"],
    paid: ["processing", "cancelled"],
    awaiting_payment: ["cancelled"],
    pending_verification: ["cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered", "cancelled"],
    delivered: ["completed"],
    completed: ["refunded"],
    refunded: [],
    failed: [],
    cancelled: [],
  };

  const actions = allowedMap[status] || [];

  if (actions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {actions.includes("processing") && (
        <button
          type="button"
          disabled={loading}
          onClick={() => updateStatus("processing")}
          className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Updating..." : "Mark Processing"}
        </button>
      )}

      {actions.includes("shipped") && (
        <button
          type="button"
          disabled={loading}
          onClick={() => updateStatus("shipped")}
          className="rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Updating..." : "Mark Shipped"}
        </button>
      )}

      {actions.includes("delivered") && (
        <button
          type="button"
          disabled={loading}
          onClick={() => updateStatus("delivered")}
          className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Updating..." : "Mark Delivered"}
        </button>
      )}

      {actions.includes("completed") && (
        <button
          type="button"
          disabled={loading}
          onClick={() => updateStatus("completed")}
          className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Updating..." : "Mark Completed"}
        </button>
      )}

      {actions.includes("cancelled") && (
        <button
          type="button"
          disabled={loading}
          onClick={() => updateStatus("cancelled")}
          className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Updating..." : "Cancel Order"}
        </button>
      )}

      {actions.includes("refunded") && (
        <button
          type="button"
          disabled={loading}
          onClick={() => updateStatus("refunded")}
          className="rounded-lg bg-purple-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Updating..." : "Refund Order"}
        </button>
      )}
    </div>
  );
}