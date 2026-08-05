


// const defaultCurrency =
//   process.env.NEXT_PUBLIC_CURRENCY?.trim().toUpperCase() ||
//   "USD";

// const defaultLocale =
//   process.env.NEXT_PUBLIC_CURRENCY_LOCALE?.trim() ||
//   "en-US";

// export function formatCurrency(
//   amount?: number | string | null,
//   currency = defaultCurrency,
//   locale = defaultLocale,
// ): string {
//   const value = Number(amount ?? 0);
//   const safeValue = Number.isFinite(value) ? value : 0;
//   const normalizedCurrency = currency.trim().toUpperCase();

//   if (normalizedCurrency === "BDT") {
//     return `৳${new Intl.NumberFormat(locale, {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     }).format(safeValue)}`;
//   }

//   try {
//     return new Intl.NumberFormat(locale, {
//       style: "currency",
//       currency: normalizedCurrency,
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     }).format(safeValue);
//   } catch {
//     return `${normalizedCurrency} ${safeValue.toFixed(2)}`;
//   }
// }


const defaultCurrency =
  process.env.NEXT_PUBLIC_CURRENCY?.trim().toUpperCase() ||
  "USD";

const defaultLocale =
  process.env.NEXT_PUBLIC_CURRENCY_LOCALE?.trim() ||
  "en-US";

export function formatCurrency(
  amount?: number | string | null,
  currency = defaultCurrency,
  locale = defaultLocale,
): string {
  const value = Number(amount ?? 0);
  const safeValue = Number.isFinite(value) ? value : 0;
  const normalizedCurrency = currency.trim().toUpperCase();

  const formatterOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  };

  if (normalizedCurrency === "BDT") {
    return `৳${new Intl.NumberFormat(locale, formatterOptions).format(safeValue)}`;
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: normalizedCurrency,
      ...formatterOptions,
    }).format(safeValue);
  } catch {
    return `${normalizedCurrency} ${safeValue}`;
  }
}