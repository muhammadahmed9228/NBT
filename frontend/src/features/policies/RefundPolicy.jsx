import React from "react";
import { Link } from "react-router-dom";

export default function RefundPolicy() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:py-16">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
        <Link to="/" className="transition hover:text-qala-bronze">Home</Link>
        <span aria-hidden="true" className="text-qala-champagne">/</span>
        <span className="text-qala-bronze">Refund & Return Policy</span>
      </nav>

      {/* Header */}
      <div className="mb-10 border-b border-qala-champagne pb-6">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-qala-bronze">
          Customer Satisfaction
        </p>
        <h1 className="text-3xl font-medium text-qala-espresso md:text-5xl font-serif">
          Refund & Return Policy
        </h1>
      </div>

      {/* Content */}
      <div className="space-y-8 text-sm leading-relaxed text-neutral-700 md:text-base">
        <section className="space-y-3">
          <h2 className="text-xl font-medium text-qala-espresso md:text-2xl font-serif">
            1. Overview & Return Window
          </h2>
          <p>
            At <strong className="text-qala-espresso">Qala</strong>, we stand behind the quality and artistry of our collections. If you are not completely satisfied with your purchase, we offer exchanges and returns within <strong className="text-qala-espresso">7 calendar days</strong> of receiving your parcel.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-medium text-qala-espresso md:text-2xl font-serif">
            2. Eligibility Criteria
          </h2>
          <p>To qualify for a return or exchange, the item must satisfy the following conditions:</p>
          <ul className="list-disc space-y-2 pl-6 text-neutral-600">
            <li>Garments must be unworn, unwashed, unaltered, and free from perfume, makeup, or stains.</li>
            <li>All original luxury tags, brand packaging, dust bags, and accessories must remain intact.</li>
            <li>Proof of purchase (order number or digital invoice) must be provided.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-medium text-qala-espresso md:text-2xl font-serif">
            3. Non-Returnable & Non-Exchangeable Items
          </h2>
          <p>The following items are strictly non-refundable and non-exchangeable:</p>
          <ul className="list-disc space-y-2 pl-6 text-neutral-600">
            <li><strong className="text-qala-espresso">Custom Sizing Orders:</strong> Garments handcrafted or tailored to individual custom measurements.</li>
            <li>Items purchased during promotional flash sales, clearance, or marked as final sale.</li>
            <li>Items returned past the 4-day eligibility period.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-medium text-qala-espresso md:text-2xl font-serif">
            4. Damaged or Incorrect Items
          </h2>
          <p>
            In the rare event that your piece arrives damaged or an incorrect item is received, please notify us within <strong className="text-qala-espresso">48 hours</strong> of delivery along with photographic evidence. Qala will promptly arrange a complimentary replacement or full refund with zero additional shipping charges.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-medium text-qala-espresso md:text-2xl font-serif">
            5. Refund Processing
          </h2>
          <p>
            Once your returned parcel is received and inspected at our fulfillment center, your refund will be processed within <strong className="text-qala-espresso">5 to 7 business days</strong> via original payment method or store credit voucher.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-medium text-qala-espresso md:text-2xl font-serif">
            6. Initiating a Return
          </h2>
          <p>
            To begin a return or exchange, please reach out us at{" "}
            <a href="qala.official1@gmail.com" className="font-medium text-qala-bronze underline hover:text-qala-espresso">
              qala.official1@gmail.com
            </a>{" "}
            or message us directly on WhatsApp (0332-2363113) with your Order ID.
          </p>
        </section>
      </div>
    </div>
  );
}