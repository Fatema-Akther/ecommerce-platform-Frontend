"use client";

import Link from "next/link";

export default function StripeCheckoutSuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f5f5f5] dark:bg-gray-950 px-4">
      <div className="w-full max-w-md rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <svg
            className="h-10 w-10 text-green-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Payment Completed
        </h1>

        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          Your payment was submitted successfully. Your order status
          will be updated after payment confirmation.
        </p>

        <Link
          href="/my-account?tab=orders"
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
        >
          View My Orders
        </Link>
      </div>
    </main>
  );
}