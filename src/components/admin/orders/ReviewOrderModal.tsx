"use client";

import { formatCurrency } from "@/utils/formatCurrency";
import { Order, ReviewAction } from "./types";



type ReviewOrderModalProps = {
  open: boolean;
  order: Order | null;
  action: ReviewAction;
  note: string;
  onChangeNote: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
};

export default function ReviewOrderModal({
  open,
  order,
  action,
  note,
  onChangeNote,
  onClose,
  onConfirm,
  loading = false,
}: ReviewOrderModalProps) {
  if (!open || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">
              {action === "approve" ? "Approve Order" : "Reject Order"}
            </h2>
            <p className="mt-1 text-sm text-gray-500 break-all">
              Order ID: {order.id}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-50"
          >
            Close
          </button>
        </div>

        <div className="mt-4 space-y-2 text-sm">
          <p>
            <span className="font-semibold">Customer:</span>{" "}
            {order.delivery.fullName}
          </p>
          <p>
            <span className="font-semibold">Phone:</span> {order.delivery.phone}
          </p>
          <p>
            <span className="font-semibold">Address:</span>{" "}
            {order.delivery.address}
            {order.delivery.state ? `, ${order.delivery.state}` : ""}
            {order.delivery.city ? `, ${order.delivery.city}` : ""}
             {order.delivery.postalCode ? `, ${order.delivery.postalCode}` : ""}
              {order.delivery.country ? `, ${order.delivery.country}` : ""}
          </p>
          <p>
            <span className="font-semibold">Total:</span>{" "}
  {formatCurrency(Number(order.total))}
          </p>
          <p>
            <span className="font-semibold">Payment:</span>{" "}
            {order.paymentMethod.toUpperCase()}
          </p>
          <p>
            <span className="font-semibold">Risk Score:</span>{" "}
            {order.riskScore ?? 0}
          </p>
          <p>
            <span className="font-semibold">Review Status:</span>{" "}
            {order.reviewStatus || "clear"}
          </p>
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Admin Note
          </label>
          <textarea
            rows={4}
            value={note}
            onChange={(e) => onChangeNote(e.target.value)}
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
            placeholder="Write review note..."
          />
        </div>

        <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
              action === "approve" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {loading
              ? "Processing..."
              : action === "approve"
              ? "Confirm Approve"
              : "Confirm Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}