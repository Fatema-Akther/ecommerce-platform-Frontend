"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function StripeCheckoutCancelContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f5f5f5] dark:bg-gray-950 px-4">
      <div className="w-full max-w-md rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
          <svg
            className="h-10 w-10 text-orange-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Payment Not Completed
        </h1>

        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          You left the Stripe payment page before completing the
          payment.
        </p>

        {orderId && (
          <p className="mt-2 break-all text-xs text-gray-500">
            Order reference: {orderId}
          </p>
        )}

        <div className="mt-6 grid gap-3">
          <Link
            href="/my-account?tab=orders"
            className="inline-flex w-full items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
          >
            View Order
          </Link>

          <Link
            href="/"
            className="inline-flex w-full items-center justify-center rounded-xl border border-gray-300 dark:border-gray-700 px-5 py-3 text-sm font-semibold text-gray-900 dark:text-white"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function StripeCheckoutCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <StripeCheckoutCancelContent />
    </Suspense>
  );
}