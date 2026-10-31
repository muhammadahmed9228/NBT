import React from "react";
import { Link } from "react-router-dom";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:py-16">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
        <Link to="/" className="transition hover:text-qala-bronze">Home</Link>
        <span aria-hidden="true" className="text-qala-champagne">/</span>
        <span className="text-qala-bronze">Privacy Policy</span>
      </nav>

      {/* Header */}
      <div className="mb-10 border-b border-qala-champagne pb-6">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-qala-bronze">
          Trust & Confidentiality
        </p>
        <h1 className="text-3xl font-medium text-qala-espresso md:text-5xl font-serif">
          Privacy Policy
        </h1>
        <p className="mt-3 text-xs text-neutral-500">
          Last Updated: September 2026
        </p>
      </div>

      {/* Content */}
      <div className="space-y-8 text-sm leading-relaxed text-neutral-700 md:text-base">
        <section className="space-y-3">
          <h2 className="text-xl font-medium text-qala-espresso md:text-2xl font-serif">
            1. Our Commitment to Your Privacy
          </h2>
          <p>
            At <strong className="text-qala-espresso">Qala</strong>, we value and respect your trust. This Privacy Policy outlines how we collect, use, protect, and handle your personal information when you visit our website, register an account, or make a purchase with us.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-medium text-qala-espresso md:text-2xl font-serif">
            2. Information We Collect
          </h2>
          <p>We may collect personal details when you interact with our platform, including:</p>
          <ul className="list-disc space-y-2 pl-6 text-neutral-600">
            <li><strong className="text-qala-espresso">Personal Identification:</strong> Full name, email address, contact phone number, and delivery address.</li>
            <li><strong className="text-qala-espresso">Order & Custom Sizing Details:</strong> Product choices, sizing specifications, and bespoke custom measurement records.</li>
            <li><strong className="text-qala-espresso">Technical & Usage Data:</strong> IP address, device type, browser settings, operating system, and on-site navigation patterns to optimize your shopping experience.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-medium text-qala-espresso md:text-2xl font-serif">
            3. How We Use Your Information
          </h2>
          <p>Your information is used strictly to deliver an exceptional luxury shopping experience:</p>
          <ul className="list-disc space-y-2 pl-6 text-neutral-600">
            <li>Processing, verifying, and dispatching your orders.</li>
            <li>Communicating tracking updates, delivery status, and order confirmations via SMS, email, or WhatsApp.</li>
            <li>Tailoring custom garments to your specific measurement specifications.</li>
            <li>Providing responsive customer support and addressing inquiries.</li>
            <li>Preventing fraudulent activities and ensuring payment security.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-medium text-qala-espresso md:text-2xl font-serif">
            4. Information Sharing & Third Parties
          </h2>
          <p>
            Qala does not sell, rent, or trade your personal data to third parties for marketing purposes. We share necessary data only with trusted partners essential for service execution:
          </p>
          <ul className="list-disc space-y-2 pl-6 text-neutral-600">
            <li><strong className="text-qala-espresso">Logistics & Couriers:</strong> Delivery address and contact number are provided to our trusted courier partners (e.g., Leopard, TCS, Trax) solely for fulfillment.</li>
            <li><strong className="text-qala-espresso">Payment Gateways:</strong> Secure, encrypted financial transaction processing.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-medium text-qala-espresso md:text-2xl font-serif">
            5. Data Security & Storage
          </h2>
          <p>
            We implement comprehensive technical and organizational security measures, including SSL encryption and restricted administrative access, to safeguard your personal data from unauthorized access, alteration, or disclosure.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-medium text-qala-espresso md:text-2xl font-serif">
            6. Contact Our Privacy Team
          </h2>
          <p>
            If you wish to review, update, or request deletion of your personal records, please reach out to us at{" "}
            <a href="mailto:privacy@qala.pk" className="font-medium text-qala-bronze underline hover:text-qala-espresso">
              privacy@qala.pk
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
