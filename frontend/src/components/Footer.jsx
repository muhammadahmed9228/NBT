import { useState } from "react";
import logoImg from "../assets/logo.jpeg";
import { Link } from 'react-router-dom';

export default function Footer() {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <footer className="nbt-footer border-t border-nbt-espresso bg-nbt-espresso text-white">
      <div className="nbt-footer-inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="nbt-footer-grid grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src={logoImg}
                alt="NBT Logo"
                className="h-10 w-auto object-contain"
              />
              <span className="font-sans text-sm font-semibold uppercase tracking-[0.18em] text-nbt-champagne">
                NBT
              </span>
            </div>
            <p className="leading-relaxed text-neutral-400">
              NBT was created with a simple belief: elegance does not need to be excessive.
              Rooted in the beauty of Eastern dressing, we create and curate pieces where timeless silhouettes meet thoughtful, contemporary details.
              Our vision is to offer clothing that feels effortless yet distinctive—pieces you return to, dress in, and make your own.
            </p>
          </div>

          <div>
            <button
              onClick={() => toggleSection('support')}
              className="flex w-full items-center justify-between md:cursor-default md:pointer-events-none text-left"
            >
              <h3 className="text-lg font-semibold tracking-wide uppercase text-white">
                Customer Support
              </h3>
              <span className="text-white md:hidden">
                {openSection === 'support' ? '−' : '+'}
              </span>
            </button>
            <ul className={`mt-4 space-y-3 text-sm text-neutral-300 overflow-hidden transition-all duration-300 ${openSection === 'support' ? 'max-h-40' : 'max-h-0'} md:max-h-none`}>
              <li>
                <h3 className="text-lg tracking-wide uppercase text-white">
                  Complains/ Need Help/ Contact
                </h3>
                <div className="flex flex-col gap-1">
                  <span>nbt.official1@gmail.com</span>
                  <span>0332-2363113</span>
                </div>
              </li>

              <li>
                <h3 className="text-lg font-semibold tracking-wide uppercase text-white">
                  Address
                </h3>
                {/* <div className="flex flex-col gap-1">
                  <span>Address (to be filled)</span>            
                </div> */}
              </li>

            </ul>
          </div>

          <div>
            <button
              onClick={() => toggleSection('menu')}
              className="flex w-full items-center justify-between md:cursor-default md:pointer-events-none text-left"
            >
              <h3 className="text-lg font-semibold tracking-wide uppercase text-white">
                Menu
              </h3>
              <span className="text-white md:hidden">
                {openSection === 'menu' ? '−' : '+'}
              </span>
            </button>
            <ul className={`mt-4 space-y-3 text-sm text-neutral-300 overflow-hidden transition-all duration-300 ${openSection === 'menu' ? 'max-h-40' : 'max-h-0'} md:max-h-none`}>
              <li>
                <a href="/" className="hover:text-white transition-colors">Home page</a>
              </li>
              <li>
                <a href="/semi-formal" className="hover:text-white transition-colors">Semi-Formal</a>
              </li>
              <li>
                <a href="/formal" className="hover:text-white transition-colors">Formal</a>
              </li>
            </ul>

            <div className="mt-6">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-white">
                Social
              </h4>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-neutral-300">
                <a
                  href="https://www.instagram.com/nbt.official__?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw=="
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Instagram
                </a>
                {/* <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Facebook
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Twitter
                </a> */}
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={() => toggleSection('info')}
              className="flex w-full items-center justify-between md:cursor-default md:pointer-events-none text-left"
            >
              <h3 className="text-lg font-semibold tracking-wide uppercase text-white">
                INFORMATION
              </h3>
              <span className="text-white md:hidden">
                {openSection === 'info' ? '−' : '+'}
              </span>
            </button>
            <ul className={`mt-4 space-y-3 text-sm text-neutral-300 overflow-hidden transition-all duration-300 ${openSection === 'info' ? 'max-h-48' : 'max-h-0'} md:max-h-none`}>
              <li>
                <Link to="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="hover:text-white transition-colors">Shipping Policy</Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="hover:text-white transition-colors">Terms and Conditions</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* <div className="mt-10 border-t border-nbt-bronze/40 pt-8">
          <div className="mb-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-nbt-champagne">
              Crafted by
            </p>
            <h3 className="mt-2 text-2xl font-medium text-white">
              Development Team
            </h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="border border-white/10 px-4 py-4">
              <p className="font-medium text-white">Wamiq Siraj</p>
              <div className="mt-2 flex flex-col gap-1 text-sm text-neutral-400 sm:flex-row sm:flex-wrap sm:gap-x-4">
                <a
                  href="tel:+923001234567"
                  className="transition hover:text-nbt-champagne"
                >
                  +92 327 0774028
                </a>
                <p className="font-medium text-white">Instagram:</p>
                <a
                  href="https://www.instagram.com/wamiq_siraj"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-nbt-champagne"
                >
                  @wamiq_siraj
                </a>
                <p className="font-medium text-white">Email:</p>
                <a
                  href="mailto:wamiqsiraj2@gmail.com"
                  className="transition hover:text-nbt-champagne"
                >
                  wamiqsiraj2@gmail.com
                </a>
              </div>
            </div>
            <div className="border border-white/10 px-4 py-4">
              <p className="font-medium text-white">Muhammad Ahmed</p>
              <div className="mt-2 flex flex-col gap-1 text-sm text-neutral-400 sm:flex-row sm:flex-wrap sm:gap-x-4">
                <a
                  href="tel:+923111234567"
                  className="transition hover:text-nbt-champagne"
                >
                  +92 322 5304113
                </a>
                <p className="font-medium text-white">Instagram:</p>
                <a
                  href="https://www.instagram.com/m_ahmed9228"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-nbt-champagne"
                >
                  @m_ahmed9228
                </a>
                <p className="font-medium text-white">Email:</p>
                <a
                  href="mailto:muhammadahmed9228@gmail.com"
                  className="transition hover:text-nbt-champagne"
                >
                  muhammadahmed9228@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div> */}

        <div className="mt-10 border-t border-neutral-700 pt-6 text-center text-sm text-neutral-400">
          <p>© {new Date().getFullYear()} NBT. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
