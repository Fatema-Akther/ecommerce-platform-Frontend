"use client";

import Link from "next/link";
import { DashboardSummary } from "@/lib/api/admin_dashboardApi";
import { formatCurrency } from "@/utils/formatCurrency";

type Props = {
  orders: DashboardSummary["recentOrders"];
};

function formatMoney(value: number) {
 return formatCurrency(Number(value || 0));
}

function formatStatus(status: string) {
  return status.replace(/_/g, " ");
}

export default function TodayRecentOrdersCard({ orders }: Props) {
  const safeOrders = orders || [];

  return (
    <div className="rounded-2xl border bg-white dark:bg-gray-800 p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-950 dark:text-gray-200">
            Today&apos;s Recent Orders
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-200">
            Latest orders placed today.
          </p>
        </div>

        <Link
          href="/admin/orders?date=today"
          className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50"
        >
          View All Today
        </Link>
      </div>

      {safeOrders.length === 0 ? (
        <div className="rounded-xl border border-dashed p-6 text-sm text-gray-500">
          No recent orders found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="bg-green-50 px-3 py-2 font-semibold">Product</th>
                <th className="bg-green-50 px-3 py-2 font-semibold">Order ID</th>
                <th className="bg-green-50 px-3 py-2 font-semibold">Customer</th>
                <th className="bg-green-50 px-3 py-2 font-semibold">Date</th>
                <th className="bg-green-50 px-3 py-2 font-semibold">Item</th>
                <th className="bg-green-50 px-3 py-2 font-semibold">Total</th>
                <th className="bg-green-50 px-3 py-2 font-semibold">Status</th>
              </tr>
            </thead>

            <tbody>
              {safeOrders.map((order) => (
                <tr key={order.id} className="border-b last:border-b-0">
                  <td className="px-3 py-3">
                    <div className="max-w-[150px] truncate">
                      {order.productName}
                    </div>
                  </td>

                  <td className="px-3 py-3">
                    <div className="max-w-[110px] truncate">
                      #{order.id.slice(0, 8)}
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-3 py-3">
                    {order.customerName}
                  </td>

                  <td className="whitespace-nowrap px-3 py-3">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-3 py-3">{order.itemCount}</td>

                  <td className="whitespace-nowrap px-3 py-3">
                    {formatMoney(order.total)}
                  </td>

                  <td className="px-3 py-3">
                    <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                      {formatStatus(order.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}