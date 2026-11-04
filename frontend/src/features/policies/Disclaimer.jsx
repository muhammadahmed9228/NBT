import React from "react";
import { Link } from "react-router-dom";

export default function Disclaimer() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:py-16">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
        <Link to="/" className="transition hover:text-nbt-bronze">Home</Link>
        <span aria-hidden="true" className="text-nbt-champagne">/</span>
        <span className="text-nbt-bronze">Disclaimer</span>
      </nav>

      {/* Header */}
      <div className="mb-10 border-b border-nbt-champagne pb-6">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-nbt-bronze">
          Legal & Compliance
        </p>
        <h1 className="text-3xl font-medium text-nbt-espresso md:text-5xl font-serif">
          Disclaimer
        </h1>
        <p className="mt-3 text-xs text-neutral-500">
          Last Updated: September 2026
        </p>
      </div>

      {/* Content */}
      <div className="space-y-8 text-sm leading-relaxed text-neutral-700 md:text-base">
        <section className="space-y-3">
          <h2 className="text-xl font-medium text-nbt-espresso md:text-2xl font-serif">
            1. General Information
          </h2>
          <p>
            The information provided by <strong className="text-nbt-espresso">NBT</strong> on our website and digital channels is for general informational and shopping purposes only. While we endeavor to keep the information up to date and correct, we make no representations or warranties of any kind, express or implied, regarding the completeness, accuracy, reliability, or availability of the website content, products, or related imagery.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-medium text-nbt-espresso md:text-2xl font-serif">
            2. Handcrafted & Fabric Variations
          </h2>
          <p>
            Many of our garments incorporate artisanal craftsmanship, intricate embellishments, delicate hand embroidery, and bespoke dye techniques. Due to the handcrafted nature of our pieces:
          </p>
          <ul className="list-disc space-y-2 pl-6 text-neutral-600">
            <li>Slight variations in threadwork, motifs, and texture are natural characteristics of Eastern craftsmanship, making every creation unique.</li>
            <li>Fabric dyes may exhibit subtle shade differences between dye lots or production batches.</li>
            <li>We recommend strict adherence to garment care instructions (dry clean only where specified) to preserve delicate embellishments and fabric integrity.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-medium text-nbt-espresso md:text-2xl font-serif">
            3. Color Representation on Digital Displays
          </h2>
          <p>
            We take extensive care during studio photography and post-processing to ensure product colors are represented as accurately as possible. However, actual colors may vary slightly due to device screen calibrations, brightness settings, ambient lighting conditions, and display technologies.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-medium text-nbt-espresso md:text-2xl font-serif">
            4. Custom Sizing & Measurements
          </h2>
          <p>
            For items ordered with our <strong className="text-nbt-espresso">Custom Sizing</strong> service, garments are tailored specifically according to the measurements submitted by the customer. NBT cannot be held responsible for fit discrepancies resulting from inaccurate or miscalculated measurements provided during checkout. Customs orders can not be returned or exchanged.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-medium text-nbt-espresso md:text-2xl font-serif">
            5. Contact & Assistance
          </h2>
          <p>
            If you have questions regarding any product specifications, fabric details, or this Disclaimer, please reach out to us at{" "}
            <a href="mailto:nbt.official1@gmail.com" className="font-medium text-nbt-bronze underline hover:text-nbt-espresso">
              nbt.official1@gmail.com
            </a>{" "}
            or message us directly on WhatsApp (0332-2363113)
          </p>
        </section>
      </div>
    </div>
  );
}