"use client";


import { Order, OrderStatus } from "@/components/admin/orders/types";
import { apiFetch } from "./baseApi";

export const OrderAPI = {
  getAllOrdersForAdmin: () =>
    apiFetch<Order[]>("/orders/admin/all", {
      auth: true,
    }),


     getMyOrders: () => 
    apiFetch<Order[]>("/orders/my", { auth: true }),  // Add this function to fetch user's orders


updateOrderStatus: (
  orderId: string,
  status: Extract<
    OrderStatus,
    | "processing"
    | "shipped"
    | "delivered"
    | "completed"
    | "cancelled"
    | "refunded"
  >,
  note?: string,
) =>
  apiFetch<Order>(`/orders/admin/${orderId}/status`, {
    method: "POST",
    body: { status, note },
    auth: true,
  }),


     // ✅ Add this
  getOrder: (orderId: string) =>
    apiFetch<Order>(`/orders/${orderId}`, { auth: true }),


  getOrderForAdmin: (orderId: string) =>
  apiFetch<Order>(`/orders/admin/${orderId}`, { auth: true })
};