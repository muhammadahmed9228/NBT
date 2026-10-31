import React from "react";
import { Link } from "react-router-dom";

export default function ShippingPolicy() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:py-16">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
        <Link to="/" className="transition hover:text-qala-bronze">Home</Link>
        <span aria-hidden="true" className="text-qala-champagne">/</span>
        <span className="text-qala-bronze">Shipping Policy</span>
      </nav>

      {/* Header */}
      <div className="mb-10 border-b border-qala-champagne pb-6">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-qala-bronze">
          Delivery & Logistics
        </p>
        <h1 className="text-3xl font-medium text-qala-espresso md:text-5xl font-serif">
          Shipping Policy
        </h1>
      </div>

      {/* Content */}
      <div className="space-y-8 text-sm leading-relaxed text-neutral-700 md:text-base">
        <section className="space-y-3">
          <h2 className="text-xl font-medium text-qala-espresso md:text-2xl font-serif">
            1. Processing & Handling Times
          </h2>
          <p>
            Every order is carefully inspected and packaged in our signature luxury wrapping prior to dispatch:
          </p>
          <ul className="list-disc space-y-2 pl-6 text-neutral-600">
            <li><strong className="text-qala-espresso">Standard In-Stock Pieces:</strong> Dispatched within 1 to 2 business days.</li>
            <li><strong className="text-qala-espresso">Custom Sizing & Made-to-Order Pieces:</strong> Require 5 to 7 business days for bespoke tailoring and quality finishing before dispatch.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-medium text-qala-espresso md:text-2xl font-serif">
            2. Domestic Delivery Timeframes (Pakistan)
          </h2>
          <p>We deliver nationwide across all major cities and remote destinations in Pakistan:</p>
          <ul className="list-disc space-y-2 pl-6 text-neutral-600">
            <li><strong className="text-qala-espresso">Major Metropolitan Areas (Karachi, Lahore, Islamabad, Rawalpindi):</strong> 2 to 4 business days.</li>
            <li><strong className="text-qala-espresso">Other Cities & Regional Towns:</strong> 3 to 6 business days.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-medium text-qala-espresso md:text-2xl font-serif">
            3. Shipping Rates
          </h2>
          <p>
            Standard shipping rates are calculated at checkout based on destination and order weight. We periodically offer complimentary free shipping promotions on qualifying cart totals.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-medium text-qala-espresso md:text-2xl font-serif">
            4. Cash on Delivery (COD) & Verification
          </h2>
          <p>
            For Cash on Delivery (COD) orders, our customer experience team may contact you via phone or WhatsApp for address and order verification before fulfillment is initiated.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-medium text-qala-espresso md:text-2xl font-serif">
            5. Tracking Your Shipment
          </h2>
          <p>
            Once your parcel is handed over to our courier partner, a tracking number and link will be shared via email and SMS/ Whatsapp so you can monitor your shipment's journey in real-time.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-medium text-qala-espresso md:text-2xl font-serif">
            6. Inquiries & Address Amendments
          </h2>
          <p>
            If you need to change your shipping address or have urgent delivery requirements, please contact us immediately at{" "}
            <a href="qala.official1@gmail.com" className="font-medium text-qala-bronze underline hover:text-qala-espresso">
             qala.official1@gmail.com
            </a>{" "}
            or via our WhatsApp support helpline (0332-2363113).
          </p>
        </section>
      </div>
    </div>
  );
}