



"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useSessionStore } from "@/stores/session";
import Image from "next/image";

import CustomerGuard from "@/components/guards/CustomerGuard";
import { BaseAPI } from "@/lib/api/baseApi";
import { useCart } from "@/features/cart/context/CartContext";

import Footer from "@/components/Footer";
import { formatCurrency } from "@/utils/formatCurrency";

const DEFAULT_IMAGE = "/assets/placeholder.webp";

type DirectCheckoutItem = {
  productId: string;
  variantId?: string;
  variantLabel?: string;
  selectedOptionIds?: string[];
  selectedOptions?: Record<string, string>;
  name: string;
  price: number;
  image?: string;
  quantity: number;
};


type StripeCheckoutResponse = {
  paymentId: string;
  provider: "stripe";
  status: string;
  checkoutSessionId: string;
  checkoutUrl: string | null;
  mock: boolean;
};

type CheckoutDisplayItem = {
  id?: string;
  productId?: string;
  variantId?: string;
  variantLabel?: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
};

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const accessToken = useSessionStore((s) => s.accessToken);
  const user = useSessionStore((s) => s.user);
  const hydrated = useSessionStore((s) => s.hydrated);

  const { items } = useCart();

  const isDirectMode = searchParams.get("mode") === "direct";

  const [directItem, setDirectItem] = useState<DirectCheckoutItem | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
const [city, setCity] = useState("");
const [state, setState] = useState("");
const [postalCode, setPostalCode] = useState("");
const [country, setCountry] = useState("US");
  const [note, setNote] = useState("");

//   const [paymentMethod, setPaymentMethod] =
// useState<"cod" | "stripe">("stripe");

const [paymentMethod, setPaymentMethod] =
  useState<"cod" | "stripe">("cod");
  
  const [placing, setPlacing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
const [shippingParcels, setShippingParcels] = useState<any[]>([]);


type ShippingRate = {
  id: string;
  provider: string;
  service?: string;
  amount: string;
  currency?: string;
  estimated_days?: number;
  rawResponse?: any;
};

type ShippingRatesResponse = {
  rates: ShippingRate[];
  parcels?: any[];
};


const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
const [selectedShippingRate, setSelectedShippingRate] =
  useState<ShippingRate | null>(null);

const [loadingRates, setLoadingRates] = useState(false);



  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!isDirectMode) {
      setDirectItem(null);
      return;
    }

    const raw = sessionStorage.getItem("direct_checkout");
    if (!raw) {
      setDirectItem(null);
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      if (parsed?.item?.productId) {
        setDirectItem(parsed.item);
      } else {
        setDirectItem(null);
      }
    } catch {
      setDirectItem(null);
    }
  }, [isDirectMode]);



  const checkoutItems = useMemo<CheckoutDisplayItem[]>(() => {
    if (isDirectMode && directItem) {
      return [directItem];
    }
    return items;
  }, [isDirectMode, directItem, items]);

  const checkoutSubtotal = useMemo(() => {
    return checkoutItems.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
      0
    );
  }, [checkoutItems]);

const deliveryCharge =
  selectedShippingRate
    ? Number(selectedShippingRate.amount)
    : 0;

  const total = checkoutSubtotal + deliveryCharge;

  const clearDirectCheckout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("direct_checkout");
    }
    setDirectItem(null);
  };

  useEffect(() => {
    if (!hydrated) return;

    if (!accessToken || !user) {
      toast.info("Please login to continue checkout");

      const redirectPath = isDirectMode ? "/checkout?mode=direct" : "/checkout";

      const timer = setTimeout(() => {
        router.replace(`/login?redirect=${encodeURIComponent(redirectPath)}`);
      }, 700);

      return () => clearTimeout(timer);
    }

    setFullName(user?.fullName || "");
    setEmail(user?.email || "");
  }, [hydrated, accessToken, user, router, isDirectMode]);

const validatePhone = (value: string) => {
  const phone = value.replace(/\s+/g, "");

  if (country === "US") {
    return /^\+1\d{10}$/.test(phone);
  }

  if (country === "CA") {
    return /^\+1\d{10}$/.test(phone);
  }

  if (country === "GB") {
    return /^\+44\d{10}$/.test(phone);
  }

  if (country === "AU") {
    return /^\+61\d{9}$/.test(phone);
  }

  return /^\+?[1-9]\d{7,14}$/.test(phone);
};



const handleGetShippingRates = async () => {

  if (!address.trim() || !city.trim() || !state.trim() || !postalCode.trim()) {
    toast.error("Please complete delivery address first");
    return;
  }


  try {

    setLoadingRates(true);


const response = await BaseAPI.post<ShippingRatesResponse>(
  "/shipping/rates",
  {
    delivery: {
      fullName: fullName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      postalCode: postalCode.trim(),
      country,
    },

    items: checkoutItems.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
    })),
  },
  true
);



    setShippingRates(
      response?.rates || []
    );
if (response?.parcels) {
  setShippingParcels(response.parcels);
}

    if (!response?.rates?.length) {
      toast.error("No shipping methods available");
      return;
    }


    toast.success("Shipping rates loaded");


  } catch(error:any){

    toast.error(
      error?.response?.data?.message ||
      "Failed to get shipping rates"
    );

  } finally {

    setLoadingRates(false);

  }

};

  const handlePlaceOrder = async () => {

    

    if (!selectedShippingRate) {
  toast.error("Please select shipping method");
  return;
}
    if (checkoutItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }


    


    if (isDirectMode && !directItem) {
      toast.error("No direct checkout item found");
      return;
    }

    if (!fullName.trim() || fullName.trim().length < 3) {
      toast.error("Please enter a valid full name");
      return;
    }

  if (!validatePhone(phone)) {
  toast.error("Please enter a valid phone number");
  return;
}


if (!city.trim()) {
  toast.error("Please enter city");
  return;
}


if (!state.trim()) {
  toast.error("Please enter state");
  return;
}


const validatePostalCode = () => {

  if (country === "US") {
    return /^\d{5}(-\d{4})?$/.test(postalCode);
  }

  if (country === "CA") {
    return /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(postalCode);
  }

  if (country === "GB") {
    return /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(postalCode);
  }

  if (country === "AU") {
    return /^\d{4}$/.test(postalCode);
  }

  return postalCode.trim().length >= 3;
};

if (!validatePostalCode()) {
  toast.error("Invalid postal code");
  return;
}


if (!country.trim()) {
  toast.error("Please select country");
  return;
}

    const validateAddress = () => {
  const value = address.trim();

  if (value.length < 12) return false;

  if (!/[a-zA-Z0-9]/.test(value)) return false;

  return true;
};

if (!validateAddress()) {
  toast.error("Please enter a valid delivery address");
  return;
}

   

    try {
      setPlacing(true);
console.log("SELECTED SHIPPING RATE BEFORE ORDER:", selectedShippingRate);
    const payload = {
  fullName: fullName.trim(),

  phone: phone.trim(),

  address: address.trim(),

  city: city.trim(),

  state: state.trim(),

  postalCode: postalCode.trim(),

  country: country.trim(),
        note: note.trim() || undefined,
shippingRateId: selectedShippingRate.id,

shippingRate: selectedShippingRate,

shippingPayload: {
  rates: shippingRates,

  shipment: selectedShippingRate.rawResponse,

  parcels:
    selectedShippingRate.rawResponse?.parcels ||
    [],
},

shippingCost:
Number(selectedShippingRate.amount),

shippingMethod:
  `${selectedShippingRate.provider} - ${selectedShippingRate.service}`,

        paymentMethod,
        
      directItem:
  isDirectMode && directItem
    ? {
        productId: directItem.productId,
        quantity: directItem.quantity,
        variantId: directItem.variantId,
        variantLabel: directItem.variantLabel,
        selectedOptionIds: directItem.selectedOptionIds,
        selectedOptions: directItem.selectedOptions,
        image: directItem.image,
      }
    : undefined,
      };

      const order = await BaseAPI.post<any>("/orders/checkout", payload, true);

      // if (order?.fraudFlag && order?.reviewStatus === "blocked") {
      //   clearDirectCheckout();
      //   toast.error("Order received but flagged for verification");
      //   router.push("/my-account?tab=orders");
      //   return;
      // }

      // if (order?.fraudFlag) {
      //   clearDirectCheckout();
      //   toast.warning("Order placed and sent for manual review");
      //   router.push("/my-account?tab=orders");
      //   return;
      // }


      /*
 * High risk:
 * Payment বন্ধ থাকবে।
 */
if (
  order?.reviewStatus === "blocked" ||
  order?.status === "pending_verification"
) {
  clearDirectCheckout();

  toast.error(
    "Your order requires verification before payment.",
  );

  router.push("/my-account?tab=orders");
  return;
}

/*
 * Medium risk:
 * শুধু warning দেখাবে।
 * Payment flow বন্ধ হবে না।
 */
if (
  order?.fraudFlag &&
  order?.reviewStatus === "pending_review"
) {
  toast.warning(
    "Your order was flagged for review, but payment can continue.",
  );
}


      if (paymentMethod === "stripe") {
  if (!order?.id) {
    throw new Error("Order ID was not returned");
  }

  const stripeSession =
    await BaseAPI.post<StripeCheckoutResponse>(
      `/payments/stripe/checkout-session/${order.id}`,
      {},
      true,
    );

  if (!stripeSession?.paymentId) {
    throw new Error("Stripe payment could not be initialized");
  }

  /*
   * stripe-mock একটি real hosted payment page দেয় না।
   * Development practice-এর জন্য backend mock-complete
   * endpoint call করা হচ্ছে।
   */
 if (stripeSession.mock) {
  const autoComplete =
    process.env.NEXT_PUBLIC_STRIPE_MOCK_AUTO_COMPLETE === "true";

  if (autoComplete) {
    await BaseAPI.post(
      `/payments/stripe/mock/complete/${stripeSession.paymentId}`,
      {},
      true,
    );

    clearDirectCheckout();

    toast.success(
      "Stripe mock payment completed successfully",
    );

    router.push("/my-account?tab=orders");
    return;
  }

  console.log(
    "Stripe mock payment ID:",
    stripeSession.paymentId,
  );

  toast.info(
    "Mock Stripe session created. Complete or expire it manually.",
  );

  router.push("/my-account?tab=orders");
  return;
}

  /*
   * Real Stripe test/live mode
   */
  if (!stripeSession.checkoutUrl) {
    throw new Error(
      "Stripe Checkout URL was not returned",
    );
  }

  clearDirectCheckout();

  window.location.assign(
    stripeSession.checkoutUrl,
  );

  return;
}

     

      clearDirectCheckout();
      setOrderSuccess(true);

      setTimeout(() => {
        router.push("/");
      }, 2800);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to place order";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setPlacing(false);
    }
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  if (!accessToken || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Redirecting to login...
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <CustomerGuard>
        <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center shadow-sm">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 animate-pulse">
              <svg
                className="h-12 w-12 text-green-600"
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

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Order Placed Successfully
            </h2>

            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              Thank you for your order.
            </p>

            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Redirecting to homepage...
            </p>

            <div className="mt-6 flex justify-center">
              <div className="flex gap-2">
                <span className="h-3 w-3 rounded-full bg-green-500 animate-bounce" />
                <span className="h-3 w-3 rounded-full bg-green-500 animate-bounce [animation-delay:0.15s]" />
                <span className="h-3 w-3 rounded-full bg-green-500 animate-bounce [animation-delay:0.3s]" />
              </div>
            </div>
          </div>
        </div>
      </CustomerGuard>
    );
  }

  return (
    <CustomerGuard>
      <div className="min-h-screen bg-[#f5f5f5] dark:bg-gray-900 px-4 py-8 ">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-5">
              Checkout
            </h1>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none cursor-not-allowed"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                  Phone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none"
                 placeholder="+1xxxxxxxxxxx"
                />
              </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

  <div>
    <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
      City
    </label>

    <input
      value={city}
      onChange={(e) => setCity(e.target.value)}
      placeholder="San Francisco"
      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none"
    />
  </div>


  <div>
    <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
      State
    </label>

    <input
      value={state}
      onChange={(e) => setState(e.target.value)}
      placeholder="CA"
      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none"
    />
  </div>


  <div>
    <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
      Postal Code
    </label>

    <input
      value={postalCode}
      onChange={(e) => setPostalCode(e.target.value)}
      placeholder="94103"
      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none"
    />
  </div>


  <div>
    <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
      Country
    </label>

    <select
      value={country}
      onChange={(e) => setCountry(e.target.value)}
      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none"
    >
      <option value="US">United States</option>
      <option value="CA">Canada</option>
      <option value="GB">United Kingdom</option>
      <option value="AU">Australia</option>
    </select>

  </div>

</div>
              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                  Address
                </label>
                <textarea
                  rows={4}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none"
                  placeholder="Enter your full address"
                />
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                  Note (Optional)
                </label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none"
                  placeholder="Any delivery note?"
                />
              </div>


<div className="mt-5">

<label className="block text-sm mb-2 font-medium">
 Shipping Method
</label>


<button
 type="button"
 onClick={handleGetShippingRates}
 disabled={loadingRates}
 className="
 rounded-lg 
 bg-blue-600
 px-4
 py-2
 text-white
 text-sm
 "
>

{
 loadingRates
 ?
 "Getting Rates..."
 :
 "Get Shipping Rates"
}

</button>


{shippingRates.length > 0 && (

<div className="mt-4 space-y-3">


{
shippingRates.map((rate, index)=>(
<label
key={`${rate.id || "rate"}-${index}`}

onClick={() => {
  console.log("LABEL CLICKED:", rate);
}}
className={`
flex
justify-between
items-center
border
rounded-lg
p-4
cursor-pointer
`}
>


<div className="flex gap-3">

<input
  type="radio"
  name="shipping"
 checked={
 selectedShippingRate?.id === rate.id
}
  onChange={() => {
    console.log("SELECTED RATE:", rate);
    setSelectedShippingRate(rate);
  }}
/>


<div>

<p className="font-semibold">
{rate.provider}
</p>


<p className="text-sm">
{rate.service}
</p>


{
rate.estimated_days &&
<p className="text-xs text-gray-500">
{rate.estimated_days} days
</p>
}


</div>

</div>


<div className="font-semibold">

${rate.amount}

</div>


</label>

))
}


</div>

)}

</div>



              <div>
                <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
                  Payment Method
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === "cod"}
                     onChange={() => {
  setPaymentMethod("cod");
}}
                    />
                    <span className="text-sm text-gray-900 dark:text-white">
                      Cash on Delivery
                    </span>
                  </label>

                  



                  {/* <label className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-3 cursor-pointer">
  <input
    type="radio"
    name="paymentMethod"
    checked={paymentMethod === "stripe"}
    onChange={() => {
  setPaymentMethod("stripe");
}}
  />

  <span className="text-sm text-gray-900 dark:text-white">
    Card Payment — Stripe
  </span>
</label> */}

<label className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-3 cursor-not-allowed opacity-50">
  <input
    type="radio"
    name="paymentMethod"
    checked={false}
    disabled
  />

  <span className="text-sm text-gray-900 dark:text-white">
    Card Payment — Stripe
  </span>

  <span className="ml-auto text-xs font-medium text-red-600">
    Unavailable
  </span>
</label>
                </div>

               
              </div>


{paymentMethod === "stripe" && (
  <div className="mt-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 p-4">
    <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
      Secure card payment with Stripe
    </p>

    {/* <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
      After creating your order, you will be redirected to the secure
      Stripe Checkout page.
    </p> */}

    <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
     Payable amount: {formatCurrency(total)}
    </p>
  </div>
)}

            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 h-fit">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Order Summary
            </h2>

            {checkoutItems.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No items in cart.
              </p>
            ) : (
              <div className="space-y-3">
                {checkoutItems.map((item, idx) => {
                  const imageSrc = item.image || DEFAULT_IMAGE;

                  return (
                    <div
                      key={`${item.id || item.productId || idx}-${item.variantId || ""}`}
                      className="flex items-center justify-between gap-3 border-b border-gray-200 dark:border-gray-800 pb-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative h-14 w-14 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex-shrink-0">
                          <Image
                            src={imageSrc}
                            alt={item.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {item.name}
                          </p>

                          {item.variantLabel ? (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {item.variantLabel}
                            </p>
                          ) : null}

                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>

                      <p className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                      {formatCurrency(
    Number(item.price) * Number(item.quantity),
  )}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-5 space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>{formatCurrency(checkoutSubtotal)}</span>
              </div>

              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Delivery</span>
                <span>{formatCurrency(deliveryCharge)}</span>
              </div>

              <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-800">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={checkoutItems.length === 0 || placing}
              className="mt-5 w-full rounded-xl font-semibold bg-[#c5c59d] dark:bg-[#d2d2c8] hover:bg-[#a7a797] py-3 text-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
            {placing
  ? paymentMethod === "stripe"
    ? "Opening Stripe..."
    : "Placing Order..."
  : paymentMethod === "stripe"
    ? "Pay with Stripe"
    : "Place Order"}
            </button>
          </div>
        </div>
        <Footer />
      </div>
      
    </CustomerGuard>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-600">
          Loading checkout...
        </div>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
}