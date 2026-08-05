"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BaseAPI } from "@/lib/api/baseApi";
import { Order } from "@/components/admin/orders/types";
import OrderDetailsCard from "@/components/admin/orders/OrderDetailsCard";

export default function OrderDetailsPage() {
  const { id } = useParams();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOrder = async () => {
    try {
      setLoading(true);

      const res = await BaseAPI.get<Order>(
        `/orders/admin/${id}`,
        true
      );

      setOrder(res);
    } catch (e) {
      console.error(e);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadOrder();
  }, [id]);

  // ✅ Proper states
  if (loading) return <div className="p-6">Loading...</div>;
  if (!order) return <div className="p-6">Order not found</div>;

  return (
    <div className="p-6">
    <OrderDetailsCard
  order={order}
  onUpdated={(updatedOrder) => {
    if (updatedOrder) {
      setOrder(updatedOrder);
    } else {
      loadOrder();
    }
  }}
/>

{/* <OrderDetailsCard
 order={order}
 onUpdated={loadOrder}
/> */}
    </div>
  );
}