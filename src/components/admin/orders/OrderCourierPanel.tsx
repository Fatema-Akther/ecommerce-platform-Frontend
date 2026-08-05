






"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CourierAPI } from "@/lib/api/courierApi";
import { CourierProvider,  Order } from "./types";
import ShipmentPayloadViewer from "./ShipmentPayloadViewer";


type Props = {
  order: Order;
  onUpdated?: (updatedOrder?: Order) => void;
};

function getDisplayStatus(shipment?: any) {
  if (!shipment) return "Not Assigned";

  if (shipment.processingStatus === "queued") return "Queued for courier";
  if (shipment.processingStatus === "processing") return "Sending to courier...";
  if (shipment.processingStatus === "failed") return "Failed to create shipment";
switch (shipment.courierStatus) {
  case "ready_to_ship":
    return "Ready to ship";

  case "assigned_to_courier":
    return "Shipped";

  case "picked_up":
    return "Picked up";

  case "in_transit":
    return "In transit";

  case "delivered":
    return "Delivered";

  case "returned":
    return "Returned";

  default:
    return "Ready to ship";
}
}

export default function OrderCourierPanel({ order, onUpdated }: Props) {
  const currentShipment = order.shipments?.[0];


 
  console.log("ORDER FROM PROPS:", order);
  console.log("SHIPPING RATE:", order.shippingRateId);
  console.log("CURRENT SHIPMENT:", currentShipment);
  console.log("TRACK URL:", currentShipment?.trackingUrl);

  const [providers, setProviders] = useState<CourierProvider[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [creatingLabel, setCreatingLabel] = useState(false);
const defaultPickupAddress =
  process.env.NEXT_PUBLIC_DEFAULT_PICKUP_ADDRESS || "";

const [pickupAddress, setPickupAddress] = useState(
  currentShipment?.pickupAddress || defaultPickupAddress
);


const [selectedProviderId, setSelectedProviderId] =
  useState("");


const [selectedRateId, setSelectedRateId] =
  useState(
    currentShipment?.adminSelectedRateId ||
    currentShipment?.selectedRateId ||
    order.shippingRateId ||
    ""
  );


  const [showPayload, setShowPayload] = useState(false);
  const [showRawPayload, setShowRawPayload] = useState(false);




useEffect(() => {
  setPickupAddress(currentShipment?.pickupAddress || defaultPickupAddress);
}, [currentShipment?.pickupAddress, defaultPickupAddress]);




useEffect(() => {

  setSelectedRateId(
    currentShipment?.adminSelectedRateId ||
    currentShipment?.selectedRateId ||
    order.shippingRateId ||
    ""
  );

}, [
  currentShipment?.adminSelectedRateId,
  currentShipment?.selectedRateId,
  order.shippingRateId,
]);

const handleCreateLabel = async () => {

 if (!selectedRateId) {
    toast.error("Customer shipping rate missing");
    return;
  }


  try {

    setCreatingLabel(true);


    const updatedOrder =
      await CourierAPI.createLabel(
        order.id,
        {
         rateId: selectedRateId,
        }
      );


    toast.success("Shipping label created");


    onUpdated?.(updatedOrder);


  } catch (err: any) {


    console.log(
      "CREATE LABEL ERROR:",
      err
    );


    const data = err?.response?.data;


    const shippoError =
      data?.details?.[0]?.text ||
      data?.details?.text ||
      data?.message ||
      err?.message ||
      // "SHIPPO LABEL ERROR";
      ""


    toast.error(shippoError);


  } finally {


    setCreatingLabel(false);


  }

};

  return (
    <div className="mt-4 rounded-xl border bg-white dark:bg-gray-800 p-4">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-200">Courier Information</h3>
        <div className="text-xs text-gray-600 dark:text-gray-200">
          Current:{" "}
          <span className="font-semibold text-gray-900 dark:text-gray-200">
            {getDisplayStatus(currentShipment)}
          </span>
        </div>
      </div>

      {currentShipment?.courierProvider && currentShipment.courierProvider.isApiEnabled && (
        <div className="mb-4 rounded-lg border bg-gray-50 dark:bg-gray-800 p-3 text-sm">
          <p>
            <span className="font-semibold">Courier:</span>{" "}
            {currentShipment.courierProvider.name}
          </p>
          <p>
            <span className="font-semibold">Status:</span>{" "}
           {currentShipment.courierStatus?.replace(/_/g, " ")}
          </p>
          {currentShipment.trackingNumber && (
            <p>
              <span className="font-semibold">Tracking:</span>{" "}
              {currentShipment.trackingNumber}
            </p>
          )}


          {currentShipment.responsePayload?.label?.labelUrl && (

<a
href={
currentShipment.responsePayload.label.labelUrl
}
target="_blank"
className="mt-2 inline-block rounded border px-3 py-2 text-xs"
>
🏷 Open Label PDF
</a>

)}

 


{order.shippingRateId && (
<div className="mt-3 rounded-lg border p-3">


<h4 className="font-semibold">
🚚 Customer Selected Shipping
</h4>


<p>
<b>Method:</b>{" "}
{order.shippingMethod}
</p>


<p>
<b>Rate ID:</b>{" "}
{order.shippingRateId}
</p>


<p>
<b>Cost:</b>{" "}
${Number(order.shippingCost).toFixed(2)}
</p>

</div>
)}




{currentShipment?.adminSelectedRate && (
<div className="mt-3 rounded-lg border border-green-500 p-3">

<h4 className="font-semibold text-green-700">
⚡ Admin Selected Rate
</h4>


<p>
<b>Provider:</b>{" "}
{currentShipment.adminSelectedRate.provider}
</p>


<p>
<b>Service:</b>{" "}
{currentShipment.adminSelectedRate.service}
</p>


<p>
<b>Cost:</b>{" "}
${Number(currentShipment.adminSelectedRate.amount).toFixed(2)}
</p>


<p className="text-xs text-gray-500">
Override reason:
{" "}
{currentShipment.rateOverrideReason || "Admin override"}
</p>


</div>
)}

{(currentShipment?.availableRates?.length ?? 0) > 0 && (

<div className="mt-3 rounded-lg border p-3">

<h4 className="font-semibold">
🚚 Select Shipping Rate
</h4>


<select

value={selectedRateId}

onChange={async(e)=>{

  const rateId = e.target.value;


  const rate =
    currentShipment.availableRates?.find(
      (r:any)=>r.id === rateId
    );


  setSelectedRateId(rateId);



  if(rate){

    try {


      const updated =
        await CourierAPI.updateShipmentRate(
          currentShipment.id,
          {
            rateId: rate.id,
            rate,
            reason:
              "Admin override after Shippo label failure",
          }
        );


      toast.success(
        "Shipping rate updated"
      );


      onUpdated?.(updated);


    } catch(err:any){


      toast.error(
        err?.message ||
        "Failed to update shipping rate"
      );


    }

  }

}}



className="
mt-2
w-full
rounded
border
p-2
text-sm
"

>

{currentShipment.availableRates?.map(
(rate:any)=>(

<option
key={rate.id}
value={rate.id}
>

{rate.provider}
-
{rate.service}
-
${rate.amount}

</option>

)

)}

</select>


</div>

)}
          {currentShipment.consignmentId && (
            <p>
              <span className="font-semibold">Consignment:</span>{" "}
              {currentShipment.consignmentId}
            </p>
          )}

        

          {currentShipment.trackingUrl && (
            <a
              href={currentShipment.trackingUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block rounded-lg border px-3 py-2 text-xs font-medium hover:bg-white"
            >
              Track Parcel
            </a>
          )}

{currentShipment?.responsePayload && (

<div className="mt-3 flex gap-2">


<button
 type="button"
 onClick={() =>
   setShowPayload(!showPayload)
 }
 className="rounded-lg border px-3 py-2 text-xs font-medium"
>
{
 showPayload
 ? "Hide Shipment Details"
 : "View Shipment Details"
}

</button>



<button
 type="button"
 onClick={() =>
   setShowRawPayload(!showRawPayload)
 }
 className="rounded-lg border px-3 py-2 text-xs font-medium"
>
{
 showRawPayload
 ? "Hide Raw JSON"
 : "Raw JSON"
}

</button>


</div>

)}


{showPayload &&
 currentShipment?.responsePayload && (

<ShipmentPayloadViewer
 payload={currentShipment.responsePayload}
/>

)}


{showRawPayload &&
 currentShipment?.responsePayload && (

<div className="
mt-4 
rounded-lg 
border 
bg-gray-900 
p-4 
text-xs 
text-green-400 
overflow-auto 
max-h-96
">

<pre>
{
JSON.stringify(
 currentShipment.responsePayload,
 null,
 2
)
}
</pre>

</div>

)}
        </div>
      )}

     


      {currentShipment?.consignmentId && (
  <p className="mt-3 text-xs text-green-600">
    Shipment already assigned to courier.
  </p>
)}






{selectedRateId &&
 !currentShipment?.trackingNumber && (
<button
  disabled={creatingLabel}
  onClick={handleCreateLabel}
  className="
    mt-4 rounded-lg 
    bg-green-600 
    px-4 py-2 
    text-sm 
    font-medium 
    text-white
    disabled:cursor-not-allowed
    disabled:opacity-50
  "
>
  {creatingLabel
    ? "Creating Label..."
    : "Create Shipping Label"}
</button>
)}





  

     
    </div>
  );
}