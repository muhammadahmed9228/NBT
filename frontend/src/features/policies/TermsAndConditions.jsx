import React from "react";
import { Link } from "react-router-dom";

export default function TermsAndConditions() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:py-16">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
        <Link to="/" className="transition hover:text-qala-bronze">Home</Link>
        <span aria-hidden="true" className="text-qala-champagne">/</span>
        <span className="text-qala-bronze">Terms & Conditions</span>
      </nav>

      {/* Header */}
      <div className="mb-10 border-b border-qala-champagne pb-6">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-qala-bronze">
          Terms of Service
        </p>
        <h1 className="text-3xl font-medium text-qala-espresso md:text-5xl font-serif">
          Terms & Conditions
        </h1>
      </div>

      {/* Content */}
      <div className="space-y-8 text-sm leading-relaxed text-neutral-700 md:text-base">
        <section className="space-y-3">
          <h2 className="text-xl font-medium text-qala-espresso md:text-2xl font-serif">
            1. Introduction & Acceptance
          </h2>
          <p>
            Welcome to <strong className="text-qala-espresso">Qala</strong>. By accessing our website, browsing our collections, or making a purchase, you acknowledge and agree to be bound by these Terms and Conditions. Please review them carefully before placing an order.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-medium text-qala-espresso md:text-2xl font-serif">
            2. Intellectual Property Rights
          </h2>
          <p>
            All content on this website—including garments, visual designs, imagery, photography, brand identity, text, logos, and graphics—is the exclusive intellectual property of Qala and is protected by applicable copyright, trademark, and trade dress laws. Unauthorized reproduction, modification, or distribution is strictly prohibited.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-medium text-qala-espresso md:text-2xl font-serif">
            3. Product Pricing & Currency
          </h2>
          <p>
            All prices listed on the storefront are in <strong className="text-qala-espresso">Pakistani Rupees (PKR)</strong> unless stated otherwise. Qala reserves the right to adjust pricing, revise promotions, or correct typographical errors at any time without prior notice.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-medium text-qala-espresso md:text-2xl font-serif">
            4. Order Placement & Acceptance
          </h2>
          <p>
            Receipt of an order confirmation does not signify our final acceptance of your order. Qala reserves the right to accept or decline your order for any legitimate reason, including inventory unavailability, suspected fraud, or pricing inaccuracies.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-medium text-qala-espresso md:text-2xl font-serif">
            5. User Conduct & Accounts
          </h2>
          <p>
            When creating an account or placing an order, you agree to provide accurate, current, and complete information. You are solely responsible for maintaining the confidentiality of your credentials and account access.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-medium text-qala-espresso md:text-2xl font-serif">
            6. Governing Law
          </h2>
          <p>
            These Terms & Conditions shall be governed by and construed in accordance with the laws of Pakistan. Any disputes arising from the use of this website shall be subject to the exclusive jurisdiction of the competent courts in Pakistan.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-medium text-qala-espresso md:text-2xl font-serif">
            7. Contact Information
          </h2>
          <p>
            For questions regarding our Terms and Conditions, please contact us at{" "}
            <a href="qala.official1@gmail.com" className="font-medium text-qala-bronze underline hover:text-qala-espresso">
              qala.official1@gmail.com
            </a>{" "}
            or message us directly on WhatsApp (0332-2363113).
          </p>
        </section>
      </div>
    </div>
  );
}