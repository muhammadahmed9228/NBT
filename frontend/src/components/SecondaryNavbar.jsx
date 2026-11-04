import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getPublicCollectionsApi } from "../features/products/api/productsApi";

export default function SecondaryNavbar({ isMobileSearchOpen = false, onCloseSearch }) {
  const [collections, setCollections] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await getPublicCollectionsApi();

        // 1. Safely drill through Axios and ApiResponse wrappers
        const responseBody = res.data || res;
        const extractedData =
          responseBody.data?.collections ||
          responseBody.collections ||
          responseBody.data ||
          responseBody;

        // 2. Strictly ensure we are setting an Array
        if (Array.isArray(extractedData)) {
          // Double-check: ensure we only show enabled collections
          const activeCollections = extractedData.filter(
            (col) => col.enabled !== false,
          );
          setCollections(activeCollections);
        } else {
          console.error(
            "SecondaryNavbar: Expected an array of collections, but received:",
            extractedData,
          );
          setCollections([]); // Fallback to empty array to prevent map() crashes
        }
      } catch (error) {
        console.error("Failed to load collections for navbar", error);
        setCollections([]);
      }
    };
    fetchCollections();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSortClick = (sortType) => {
    navigate(`/products?sort=${sortType}`);
  };

  return (
    <div className="nbt-secondary-nav relative z-[70] overflow-visible border-b border-nbt-champagne/60 bg-nbt-cream">
      <div className="nbt-secondary-nav-inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between overflow-visible no-scrollbar">
        <div className="relative flex-shrink-0 z-[80]" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex cursor-pointer items-center gap-2 py-2 text-xs font-semibold tracking-[0.16em] text-nbt-espresso hover:text-nbt-bronze"
          >
            SHOP BY COLLECTION
            <svg
              className={`w-4 h-4 cursor-pointer transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="nbt-collection-menu absolute top-full left-0 mt-1 w-56 bg-white border border-neutral-200 shadow-xl rounded-md overflow-visible z-[999] animate-fade-in-up">
              {collections.length > 0 ? (
                collections.map((col) => (
                  <Link
                    key={col._id}
                    to={`/collections/${col.slug}`}
                    onClick={() => setIsDropdownOpen(false)}
                    className="block px-4 py-3 text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 border-b border-neutral-50 transition"
                  >
                    {col.name}
                  </Link>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-neutral-500">
                  No collections available
                </div>
              )}
              <Link
                to="/products"
                onClick={() => setIsDropdownOpen(false)}
                className="block px-4 py-3 text-sm font-bold text-black bg-neutral-100 hover:bg-neutral-200 transition"
              >
                View All Products &rarr;
              </Link>
            </div>
          )}
        </div>

        {/* Right Side: Quick links and mobile close button if search is open */}
        <div className="flex items-center space-x-6 ml-6 flex-shrink-0">
          <button
            onClick={() => handleSortClick("createdAt")}
            className="cursor-pointer text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 transition hover:text-nbt-bronze"
          >
            New Arrivals
          </button>
          <button
            onClick={() => handleSortClick("bestselling")}
            className="text-xs font-semibold cursor-pointer text-neutral-500 hover:text-black tracking-wider uppercase transition"
          >
            Bestsellers
          </button>
          <button
            onClick={() => handleSortClick("featured")}
            className="text-xs font-semibold cursor-pointer text-neutral-500 hover:text-black tracking-wider uppercase transition"
          >
            Featured
          </button>

          {/* Close button on mobile if search or mobile drawer open */}
          {(isMobileSearchOpen || onCloseSearch) && (
            <button
              type="button"
              onClick={onCloseSearch}
              aria-label="Close search navbar"
              className="flex h-8 w-8 items-center justify-center rounded-full text-nbt-espresso hover:bg-nbt-champagne/40 transition cursor-pointer md:hidden"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
