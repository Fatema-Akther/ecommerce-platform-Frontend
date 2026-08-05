// export const getOrderBadge = (order: {
//   status: string;
//   reviewStatus?: string;
//   fraudFlag?: boolean;
//   riskScore?: number;
// }) => {
//   if (order.status === "pending_verification") {
//     return {
//       label: "Pending Verification",
//       className:
//         "inline-flex items-center rounded-full bg-red-100 text-red-700 px-3 py-1 text-xs font-semibold",
//     };
//   }

//   if (order.reviewStatus === "blocked") {
//     return {
//       label: "Blocked Risk",
//       className:
//         "inline-flex items-center rounded-full bg-red-100 text-red-700 px-3 py-1 text-xs font-semibold",
//     };
//   }

//   if (order.reviewStatus === "pending_review") {
//     return {
//       label: "Under Review",
//       className:
//         "inline-flex items-center rounded-full bg-yellow-100 text-yellow-700 px-3 py-1 text-xs font-semibold",
//     };
//   }

//   if (order.reviewStatus === "verified") {
//     return {
//       label: "Verified",
//       className:
//         "inline-flex items-center rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-xs font-semibold",
//     };
//   }

//   if (order.reviewStatus === "rejected") {
//     return {
//       label: "Rejected",
//       className:
//         "inline-flex items-center rounded-full bg-gray-200 text-gray-700 px-3 py-1 text-xs font-semibold",
//     };
//   }

//   if (order.fraudFlag || (typeof order.riskScore === "number" && order.riskScore >= 40)) {
//     return {
//       label: "Suspicious",
//       className:
//         "inline-flex items-center rounded-full bg-orange-100 text-orange-700 px-3 py-1 text-xs font-semibold",
//     };
//   }

//   return {
//     label: "Normal",
//     className:
//       "inline-flex items-center rounded-full bg-green-100 text-green-700 px-3 py-1 text-xs font-semibold",
//   };
// };



export const getOrderBadge = (order: {
  status: string;
  reviewStatus?: string;
  fraudFlag?: boolean;
  riskScore?: number;
}) => {
  if (order.status === "pending_verification") {
    return {
      label: "Pending Verification",
      className:
        "inline-flex items-center rounded-full bg-red-100 text-red-700 px-3 py-1 text-xs font-semibold",
    };
  }

  if (order.status === "refunded") {
    return {
      label: "Refunded",
      className:
        "inline-flex items-center rounded-full bg-purple-100 text-purple-700 px-3 py-1 text-xs font-semibold",
    };
  }

  if (order.status === "completed") {
    return {
      label: "Completed",
      className:
        "inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-semibold",
    };
  }

  if (order.status === "cancelled") {
    return {
      label: "Cancelled",
      className:
        "inline-flex items-center rounded-full bg-gray-200 text-gray-700 px-3 py-1 text-xs font-semibold",
    };
  }

  if (order.status === "failed") {
    return {
      label: "Failed",
      className:
        "inline-flex items-center rounded-full bg-rose-100 text-rose-700 px-3 py-1 text-xs font-semibold",
    };
  }

  if (order.status === "delivered") {
    return {
      label: "Delivered",
      className:
        "inline-flex items-center rounded-full bg-green-100 text-green-700 px-3 py-1 text-xs font-semibold",
    };
  }

  if (order.status === "shipped") {
    return {
      label: "Shipped",
      className:
        "inline-flex items-center rounded-full bg-amber-100 text-amber-700 px-3 py-1 text-xs font-semibold",
    };
  }

  if (order.status === "processing") {
    return {
      label: "Processing",
      className:
        "inline-flex items-center rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-xs font-semibold",
    };
  }

  if (order.status === "awaiting_payment") {
    return {
      label: "Awaiting Payment",
      className:
        "inline-flex items-center rounded-full bg-orange-100 text-orange-700 px-3 py-1 text-xs font-semibold",
    };
  }

  if (order.reviewStatus === "blocked") {
    return {
      label: "Blocked Risk",
      className:
        "inline-flex items-center rounded-full bg-red-100 text-red-700 px-3 py-1 text-xs font-semibold",
    };
  }

  if (order.reviewStatus === "pending_review") {
    return {
      label: "Under Review",
      className:
        "inline-flex items-center rounded-full bg-yellow-100 text-yellow-700 px-3 py-1 text-xs font-semibold",
    };
  }

  if (order.reviewStatus === "verified") {
    return {
      label: "Verified",
      className:
        "inline-flex items-center rounded-full bg-cyan-100 text-cyan-700 px-3 py-1 text-xs font-semibold",
    };
  }

  if (order.reviewStatus === "rejected") {
    return {
      label: "Rejected",
      className:
        "inline-flex items-center rounded-full bg-gray-200 text-gray-700 px-3 py-1 text-xs font-semibold",
    };
  }

  if (order.fraudFlag || (typeof order.riskScore === "number" && order.riskScore >= 40)) {
    return {
      label: "Suspicious",
      className:
        "inline-flex items-center rounded-full bg-orange-100 text-orange-700 px-3 py-1 text-xs font-semibold",
    };
  }

  if (order.status === "paid") {
    return {
      label: "Paid",
      className:
        "inline-flex items-center rounded-full bg-indigo-100 text-indigo-700 px-3 py-1 text-xs font-semibold",
    };
  }

  if (order.status === "pending") {
    return {
      label: "Pending",
      className:
        "inline-flex items-center rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-xs font-semibold",
    };
  }

  return {
    label: "Normal",
    className:
      "inline-flex items-center rounded-full bg-green-100 text-green-700 px-3 py-1 text-xs font-semibold",
  };
};