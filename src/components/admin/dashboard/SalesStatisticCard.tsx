"use client";

import { DashboardSummary } from "@/lib/api/admin_dashboardApi";
import { formatCurrency } from "@/utils/formatCurrency";

type Props = {
  data: DashboardSummary["monthlySales"];
};

function formatMoney(value: number) {
 return formatCurrency(Number(value || 0));
}

export default function SalesStatisticCard({ data }: Props) {
  const safeData = data || [];
  const maxValue = Math.max(
    ...safeData.map((item) => Number(item.total || 0)),
    1
  );

  return (
    <div className="rounded-2xl border bg-white dark:bg-gray-700 p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-950 dark:text-gray-200">Sales Statistic</h2>

        <div className="rounded-lg bg-gray-100 dark:bg-gray-300 px-3 py-2 text-sm text-gray-700">
          Yearly
        </div>
      </div>


<div className="overflow-x-auto pb-2">
      <div className="flex h-64 items-end gap-3">
        {safeData.map((item) => {
          const total = Number(item.total || 0);
          const height = Math.max((total / maxValue) * 100, 2);

          return (
            <div
              key={item.month}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <div className="flex h-48 w-full items-end rounded-lg bg-gray-50 dark:bg-gray-600">
                <div
                  className="w-full rounded-lg bg-green-400 transition-all"
                  style={{ height: `${height}%` }}
                  title={`${item.month}: ${formatMoney(total)}`}
                />
              </div>

              <span className="text-xs text-gray-500 dark:text-gray-300">{item.month}</span>
            </div>
          );
        })}
      </div>
</div>

    </div>
  );
}