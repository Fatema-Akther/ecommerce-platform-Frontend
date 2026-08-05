"use client";

import { DashboardSummary } from "@/lib/api/admin_dashboardApi";
import { formatCurrency } from "@/utils/formatCurrency";

type Props = {
  data: DashboardSummary["productSales"];
  totalSales: number;
};

function formatMoney(value: number) {
 return formatCurrency(Number(value || 0));
}

export default function ProductSalesOverviewCard({ data, totalSales }: Props) {
  const safeData = data || [];

  const colors = [
    "bg-blue-500",
    "bg-emerald-500",
    "bg-orange-500",
    "bg-purple-500",
    "bg-rose-500",
  ];

  return (
    <div className="rounded-2xl border bg-white dark:bg-gray-800 p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-950 dark:text-gray-200">
        Product Sales Overview
      </h2>

      <div className="mt-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">Successful Product Sales by Quantity</p>
        <p className="text-2xl font-bold text-gray-950 dark:text-gray-200">
          {formatMoney(totalSales)}
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {safeData.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-200">No product sales data yet.</p>
        ) : (
          safeData.map((item, index) => {
            const percent = Math.max(
              0,
              Math.min(Number(item.percent || 0), 100)
            );

            return (
              <div key={item.productId}>
                <div className="mb-1 flex items-start justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-700 dark:text-gray-200">
                      {item.name}
                    </p>

                    <p className="mt-0.5 text-xs text-gray-500">
                      Qty Sold: {Number(item.quantitySold || 0).toLocaleString()} ·{" "}
                      {formatMoney(item.amount)}
                    </p>
                  </div>

                  <span className="shrink-0 text-gray-500">{percent}%</span>
                </div>

                <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-3 rounded-full ${
                      colors[index % colors.length]
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}