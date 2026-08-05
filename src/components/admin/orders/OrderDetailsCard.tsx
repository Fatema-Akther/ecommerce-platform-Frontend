




"use client";

import Image from "next/image";
import Link from "next/link";
import { Order } from "./types";

import { toast } from "sonner";
import { BaseAPI } from "@/lib/api/baseApi";
import { useState } from "react";
import { formatCurrency } from "@/utils/formatCurrency";
import OrderCourierPanel from "./OrderCourierPanel";

type Props = {
  order: Order;
  onUpdated?: (updatedOrder?: Order) => void;
};

function getItemImage(item: NonNullable<Order["items"]>[number]) {
  if (item.imageSnapshot) return item.imageSnapshot;

  const media = item.product?.media ?? [];
  const firstImage = [...media]
    .filter((m) => m.type === "image" && m.url)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))[0];

  return firstImage?.url || "/assets/placeholder.png";
}

function getItemName(item: NonNullable<Order["items"]>[number]) {
  return item.nameSnapshot || item.product?.name || "Product";
}

function getProductHref(item: NonNullable<Order["items"]>[number]) {
  const slug = item.product?.slug;
  return slug ? `/products/${slug}` : null;
}



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



export default function OrderDetailsCard({
  order,
  onUpdated,
}: Props) {
  const [loading, setLoading] = useState(false);
const [rejectionReason, setRejectionReason] = useState<string>("");

const [reviewModalAction, setReviewModalAction] = useState<
  "approve" | "reject" | null
>(null);

  const riskSignals = order.riskSignals ?? null;
  const riskFactors = riskSignals?.riskFactors ?? [];
  const riskLevel = riskSignals?.riskLevel ?? "low";
 const getRiskColor = (level: string) => {
  switch (level.toLowerCase()) {
    case "high":
      return "bg-red-600 text-white";
    case "medium":
      return "bg-yellow-500 text-black";
    case "low":
      return "bg-green-600 text-white";
    default:
      return "bg-gray-400 text-white";
  }
};

  // ✅ business rules
  const canReviewOrder = order.status === "pending_verification";

 



    const courierBlockedStatuses = [
  "pending_verification",
  "awaiting_payment",
  "failed",
  "cancelled",
  "rejected",
  "refunded",
];

const shouldShowCourierPanel =
  !courierBlockedStatuses.includes(order.status);

 const openOrderReviewModal = (action: "approve" | "reject") => {
  setReviewModalAction(action);
  setRejectionReason("");
};

const closeOrderReviewModal = () => {
  if (loading) return;

  setReviewModalAction(null);
  setRejectionReason("");
};
 
const handleReview = async (action: "approve" | "reject") => {
  try {
    setLoading(true);

    const fraudNote =
      action === "reject" && rejectionReason.trim()
        ? rejectionReason.trim()
        : undefined;

    if (!canReviewOrder) {
      throw new Error("Invalid action for this order state");
    }

    await BaseAPI.post(
      `/orders/admin/${order.id}/review`,
      {
        action,
        note: fraudNote,
      },
      true
    );

    toast.success(
      action === "approve"
        ? "Order approved"
        : "Order rejected"
    );

    setRejectionReason("");
    setReviewModalAction(null);

    onUpdated?.();

  } catch (e: any) {
    toast.error(
      e?.response?.data?.message ||
      e?.message ||
      "Failed"
    );
  } finally {
    setLoading(false);
  }
};


const riskScore = order.riskScore ?? 0;


  return (
    <div className="rounded-xl border bg-gray-50 dark:bg-gray-800 p-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* ================= LEFT: CUSTOMER ================= */}
        <div className="space-y-2 text-sm">
          <p><b>Customer:</b> {order.delivery.fullName}</p>
          <p><b>Phone:</b> {order.delivery.phone}</p>
           {order.user?.email && (
            <p><b>Email:</b> {order.user.email}</p>
          )}


  <p>
    <b>Payment:</b>{" "}
    <span className="uppercase">{order.paymentMethod}</span>
  </p>



 <p>
  <b>Total:</b> {formatCurrency(Number(order.total))}
</p>
  <p>
    <b>Status:</b> {order.status}
  </p>

    

           <p >
            <p><b>Address:</b> {order.delivery.address}</p>
              <p><b>City:</b> {order.delivery.city}</p>
           <p><b>State:</b> {order.delivery.state}</p>
           <p><b>postalCode:</b> {order.delivery.postalCode}</p>
           <p><b>country:</b> {order.delivery.country}</p>
            
          
            
          </p>

         

       {order.delivery?.note && (
  <div className="mt-3 p-3 bg-orange-50 border-l-4 border-orange-500 rounded">
    <p className="font-semibold text-orange-700">Customer Note</p>
    <p className="text-sm text-gray-700">{order.delivery.note}</p>
  </div>
)}

          {order.adminReviewNote && (
            <p><b>Admin Note:</b> {order.adminReviewNote}</p>
          )}
        </div>

        {/* ================= RIGHT: ITEMS ================= */}
        <div>
          <h3 className="mb-2 text-sm font-semibold">Items</h3>

          <div className="space-y-3">
          {(order.items ?? []).map((item) => {
              const href = getProductHref(item);

              const content = (
                <div className="flex justify-between gap-3 rounded-lg border bg-white dark:bg-gray-700 p-3">
                  <div className="flex gap-3">
                    <div className="relative h-14 w-14">
                      <Image
                        src={getItemImage(item)}
                        alt={getItemName(item)}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div>
                      <div className="font-medium">
                        {getItemName(item)}
                      </div>

                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Qty: {item.quantity}
                      </div>

                      {item.variantLabel && (
                        <div className="text-xs text-gray-700">
                          {item.variantLabel}
                        </div>
                      )}
                    </div>
                  </div>

                 <div className="font-medium">
  {formatCurrency(Number(item.lineTotal))}
</div>
                </div>
              );

              return href ? (
                <Link key={item.id} href={href}>{content}</Link>
              ) : (
                <div key={item.id}>{content}</div>
              );
            })}
          </div>

          {/* ================= RISK ================= */}
          {riskSignals && (
            <div className="mt-4 space-y-3">
                <b className="text-red-600">🚨 Risk Factors Detected</b>
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-400 dark:border-red-800 p-4 rounded">
                <div className="flex justify-between text-red-600">
                  <b>Risk Analysis</b>
            <span className={`px-2 py-1 text-xs font-bold rounded-full ${getRiskColor(riskLevel)}`}>
  {riskLevel.toUpperCase()}
</span>
                </div>

                <div className="grid grid-cols-2 mt-2 text-sm">


                  <div className="flex items-center gap-2">
  <span className="text-sm font-medium">Risk Score:</span>

  <span className={`px-2 py-1 text-xs font-bold rounded-full ${
  riskScore > 70 
    ? "bg-red-600 text-white"
    : riskScore > 40
    ? "bg-yellow-500 text-black"
    : "bg-green-500 text-white"
}`}>
  {riskScore}
</span>
</div>
                 
                

<div className="flex flex-wrap items-center gap-2">
  <b>Review Status:</b>

  <span
    className={`inline-flex  px-2.5 py-1 text-xs font-semibold ${getReviewStatusClass(
      order.reviewStatus
    )}`}
  >
    {formatReviewStatus(order.reviewStatus)}
  </span>
</div>
                </div>
              </div>


             

             {riskFactors.map((f, i) => (

              
  <li
    key={i}
    className={`text-sm p-2 rounded border ${
      f.points >= 20
        ? "bg-red-100 border-red-300 dark:bg-red-900/30"
        : f.points >= 10
        ? "bg-yellow-100 border-yellow-300 dark:bg-yellow-900/30"
        : "bg-gray-100 dark:bg-gray-800"
    }`}
  >
    <b>{f.title}</b> (+{f.points})
    <div>{f.description}</div>
  </li>
))}
            </div>
          )}

          {/* ================= FRAUD REVIEW ================= */}
         {canReviewOrder && (
  <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950/20">
    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
      Order Verification Required
    </h4>

    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
      Review this order before approving or rejecting it.
    </p>

    <div className="mt-3 flex gap-2">
      <button
        type="button"
        disabled={loading}
        onClick={() => openOrderReviewModal("approve")}
        className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        Approve
      </button>

      <button
        type="button"
        disabled={loading}
        onClick={() => openOrderReviewModal("reject")}
        className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        Reject
      </button>
    </div>
  </div>
)}

          {/* ================= BKASH REVIEW ================= */}
        {/* ================= BKASH REVIEW ================= */}

        </div>


      </div>

     {!shouldShowCourierPanel && (
  <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
    Courier panel is hidden until the order is approved.
  </div>
)}

{shouldShowCourierPanel && (
  <div className="h-[600px] overflow-y-auto border rounded-lg p-4">
    <OrderCourierPanel
  order={order}
  onUpdated={(updatedOrder) => {
    if (updatedOrder) {
      onUpdated?.(updatedOrder);
    }
  }}
/>
  </div>
)}


{reviewModalAction && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
    <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl dark:bg-gray-800">
      <div className="flex items-start justify-between gap-3">
        <div>
         <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
  {reviewModalAction === "approve"
    ? "Approve Order"
    : "Reject Order"}
</h2>

          <p className="mt-1 break-all text-sm text-gray-500 dark:text-gray-400">
            Order ID: {order.id}
          </p>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={closeOrderReviewModal}
          className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50 dark:hover:bg-gray-700"
        >
          Close
        </button>
      </div>

      <div className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-200">
        <p>
          <span className="font-semibold">Customer:</span>{" "}
          {order.delivery.fullName}
        </p>

        <p>
          <span className="font-semibold">Phone:</span>{" "}
          {order.delivery.phone}
        </p>

       <p>
  <span className="font-semibold">Total:</span>{" "}
  {formatCurrency(order.total)}
</p>

        <p>
          <span className="font-semibold">Risk Score:</span>{" "}
          {order.riskScore ?? 0}
        </p>
      </div>




    {reviewModalAction === "reject" && (
  <div className="mt-4">
    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
      Rejection Note

      <span className="ml-1 text-xs font-normal text-gray-500">
        (optional)
      </span>
    </label>

    <textarea
      rows={4}
    value={rejectionReason}
     onChange={(e) => {
  setRejectionReason(e.target.value);
}}
      placeholder="Example: Customer information could not be verified."
      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-red-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
    />

    
  </div>
)}

      <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          disabled={loading}
          onClick={closeOrderReviewModal}
          className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 dark:hover:bg-gray-700"
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => handleReview(reviewModalAction)}
          className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
            reviewModalAction === "approve"
              ? "bg-green-600 hover:bg-green-700"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
        {loading
  ? "Processing..."
  : reviewModalAction === "approve"
  ? "Confirm Approve"
  : "Confirm Reject"}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}













