"use client";

type Props = {
  payload: any;
};

export default function ShipmentPayloadViewer({
  payload,
}: Props) {

const shipment =
  payload?.shipment || {};
  
const transaction =
  shipment?.transaction || {};

const label = payload?.label;

  return (
    <div className="mt-4 space-y-4 text-sm">

      <div className="rounded-lg border p-4">
        <h4 className="font-semibold mb-3">
          📦 Shipment Summary
        </h4>

        <p>
          <b>Status:</b>{" "}
          {shipment?.status || "N/A"}
        </p>

        <p>
          <b>Shipment ID:</b>{" "}
          {shipment?.object_id || "N/A"}
        </p>

        <p>
          <b>Test Mode:</b>{" "}
          {shipment?.test ? "Yes" : "No"}
        </p>

      </div>


      <div className="rounded-lg border p-4">

        <h4 className="font-semibold mb-3">
          📍 Pickup Address
        </h4>

        <p>
          Store Name:{shipment?.address_from?.name}
        </p>

        <p>
          Address:{shipment?.address_from?.street1}
        </p>
        <p>
  Phone: {shipment?.address_from?.phone || "No phone"}
</p>

        <p>
         <p> City:{shipment?.address_from?.city},{" "}</p>
          State:{shipment?.address_from?.state}{" "}
          Zip:{shipment?.address_from?.zip}
        </p>

      </div>



      <div className="rounded-lg border p-4">

        <h4 className="font-semibold mb-3">
          📍 Delivery Address
        </h4>

      <p>
  Nmae:{shipment?.address_to?.name}
</p>

<p>
  Address:{shipment?.address_to?.street1}
</p>

<p>
  Phone: {shipment?.address_to?.phone || "No phone"}
</p>

<p>
  City:{shipment?.address_to?.city},{" "}
  State:{shipment?.address_to?.state}{" "}
  Zip:{shipment?.address_to?.zip}
</p>
      </div>


<div className="rounded-lg border p-4">

  <h4 className="font-semibold mb-3">
    📦 Parcel Information
  </h4>


  {shipment?.parcels?.length > 0 ? (

    shipment.parcels.map((parcel:any, index:number)=>(

      <div 
        key={index}
        className="mb-3 border-b pb-3 last:border-b-0"
      >

        <p>
          <b>Parcel:</b> {index + 1}
        </p>


        <p>
          <b>Weight:</b>{" "}
          {parcel.weight || "N/A"}{" "}
          {parcel.mass_unit || ""}
        </p>


        <p>
          <b>Dimensions:</b>{" "}
          {parcel.length || "-"} ×{" "}
          {parcel.width || "-"} ×{" "}
          {parcel.height || "-"}{" "}
          {parcel.distance_unit || ""}
        </p>


      </div>

    ))

  ) : (

    <p>No parcel information</p>

  )}

</div>



      <div className="rounded-lg border p-4">

        <h4 className="font-semibold mb-3">
          🚚 Shipping Rates
        </h4>


     {shipment?.selectedRate ? (
<div>

<b>
{shipment.selectedRate.provider}
</b>

{" - "}

{shipment.selectedRate.service}

<br/>

${shipment.selectedRate.amount}

</div>

):(
<p>No rate selected</p>
)}

      </div>



      {label && (

      <div className="rounded-lg border p-4">

        <h4 className="font-semibold mb-3">
          🏷 Label Information
        </h4>


        <p>
          <b>Tracking:</b>{" "}
          {label.trackingNumber}
        </p>


        {label.labelUrl && (
          <a
            href={label.labelUrl}
            target="_blank"
            className="text-blue-600 underline"
          >
            Open Label PDF
          </a>
        )}

      </div>

      )}

    </div>
  );
}