"use client";

import { DashboardSummary } from "@/lib/api/admin_dashboardApi";
import { formatCurrency } from "@/utils/formatCurrency";

type Props = {
  data: DashboardSummary["categorySales"];
  totalSales: number;
};

function formatMoney(value: number) {
 return formatCurrency(Number(value || 0));
}

export default function SalesOverviewCard({ data, totalSales }: Props) {
  const colors = [
    "bg-violet-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-green-500",
    "bg-sky-500",
  ];

  const safeData = data || [];

  return (
    <div className="rounded-2xl border bg-white dark:bg-gray-800 p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-950 dark:text-gray-200">Sales Overview by Category</h2>

      <div className="mt-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">Total Sales</p>
        <p className="text-2xl font-bold text-gray-950 dark:text-gray-200">
          {formatMoney(totalSales)}
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {safeData.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-200">No category sales data yet.</p>
        ) : (
          safeData.map((item, index) => {
            const percent = Math.max(0, Math.min(Number(item.percent || 0), 100));

            return (
              <div key={item.name}>
                <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                  <span className="max-w-[160px] truncate font-medium text-gray-700 dark:text-gray-200">
                    {item.name}
                  </span>

                  <span className="shrink-0 text-gray-500">{percent}%</span>
                </div>

                <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-3 rounded-full ${colors[index % colors.length]}`}
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