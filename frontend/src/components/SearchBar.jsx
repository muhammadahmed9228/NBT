import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getProductsApi, getPublicCollectionsApi } from "../features/products/api/productsApi";
import { getAdminProductsApi, getAdminCollectionsApi } from "../features/admin/api/adminApi";

export default function SearchBar({ isAdmin = false, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ products: [], collections: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Close the dropdown if the user clicks anywhere outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced Search Logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setResults({ products: [], collections: [] });
        setIsOpen(false);
        return;
      }

      setLoading(true);
      setIsOpen(true);
      
      try {
        let pRes, cRes;
        
        // Use different APIs based on if this is mounted in the Admin Panel or Public Site
        if (isAdmin) {
           pRes = await getAdminProductsApi({ search: query, limit: 5 });
           cRes = await getAdminCollectionsApi({ limit: 100 }); // Fetch all to filter locally
        } else {
           pRes = await getProductsApi({ search: query, limit: 5 });
           cRes = await getPublicCollectionsApi({ limit: 100 });
        }

        const productsData = pRes.data.products || pRes.data || [];
        const collectionsData = cRes.data.collections || cRes.data || [];

        // Filter collections locally since there are usually few of them
        const matchedCollections = collectionsData.filter(c => 
          c.name.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 3); // Max 3 collections in dropdown

        setResults({ products: productsData, collections: matchedCollections });
      } catch (error) {
        console.error("Search failed");
      } finally {
        setLoading(false);
      }
    }, 300); // Wait 300ms after user stops typing to fetch

    return () => clearTimeout(timer);
  }, [query, isAdmin]);

  const handleClearQuery = () => {
    setQuery("");
    setResults({ products: [], collections: [] });
    setIsOpen(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleProductClick = (id) => {
    setIsOpen(false);
    setQuery("");
    if (onClose) onClose();
    if (isAdmin) navigate(`/admin/products/${id}/edit`);
    else navigate(`/products/${id}`);
  };

  const handleCollectionClick = (slug) => {
    setIsOpen(false);
    setQuery("");
    if (onClose) onClose();
    if (isAdmin) navigate(`/admin/collections`); // Admins manage all collections centrally
    else navigate(`/collections/${slug}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      if (onClose) onClose();
      if (isAdmin) navigate(`/admin/products?search=${encodeURIComponent(query)}`);
      else navigate(`/products?search=${encodeURIComponent(query)}`);
      setQuery("");
    }
  };

  return (
    <div ref={wrapperRef} className="relative flex-1 max-w-md w-full z-[120]">
      <form onSubmit={handleSubmit} className="flex w-full items-center shadow-sm">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isAdmin ? "Admin search (Products, Collections)..." : "Search products, collections..."}
            className={`w-full rounded-l-md border border-qala-champagne bg-white/90 pl-4 ${
              query ? "pr-10" : "pr-4"
            } py-2 text-sm text-qala-ink placeholder:text-neutral-400 focus:border-qala-bronze focus:outline-none`}
            autoComplete="off"
          />

          {/* "X" clear button at the very right side of the search input */}
          {query.trim() !== "" && (
            <button
              type="button"
              onClick={handleClearQuery}
              aria-label="Clear search text"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full text-neutral-400 hover:text-qala-espresso hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3.5 w-3.5"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <button
          type="submit"
          className="cursor-pointer shrink-0 rounded-r-md bg-qala-bronze px-4 py-2 text-sm text-white transition hover:bg-qala-espresso"
        >
          Search
        </button>

        {/* Mobile close button if onClose provided */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search bar"
            className="ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-qala-champagne bg-white text-qala-espresso hover:bg-qala-champagne/30 transition cursor-pointer md:hidden"
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
      </form>

      {/* Live Results Dropdown */}
      {isOpen && query.trim() !== "" && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-md shadow-xl overflow-hidden max-h-[70vh] overflow-y-auto z-[130]">
          {loading ? (
            <div className="p-4 text-center text-sm text-neutral-500 animate-pulse">Searching...</div>
          ) : results.products.length === 0 && results.collections.length === 0 ? (
            <div className="p-4 text-center text-sm text-neutral-500">No results found for "{query}"</div>
          ) : (
            <div className="py-2">
              
              {/* Collections Results */}
              {results.collections.length > 0 && (
                <div className="mb-2">
                  <h4 className="px-4 py-1 text-xs font-bold text-neutral-400 uppercase tracking-wider bg-neutral-50">Collections</h4>
                  {results.collections.map(col => (
                    <button 
                      key={col._id} 
                      onClick={() => handleCollectionClick(col.slug)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-100 flex items-center transition"
                    >
                      <span className="font-medium text-indigo-700">{col.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Products Results */}
              {results.products.length > 0 && (
                <div>
                  <h4 className="px-4 py-1 text-xs font-bold text-neutral-400 uppercase tracking-wider bg-neutral-50 border-t">Products</h4>
                  {results.products.map(prod => (
                    <button 
                      key={prod._id} 
                      onClick={() => handleProductClick(prod._id)}
                      className="w-full text-left px-4 py-2 hover:bg-neutral-100 flex items-center gap-3 transition"
                    >
                      {prod.thumbnail?.url ? (
                        <img src={prod.thumbnail.url} alt={prod.name} className="w-10 h-12 object-cover rounded border" />
                      ) : (
                        <div className="w-10 h-12 bg-neutral-200 rounded border"></div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-neutral-900 line-clamp-1">{prod.name}</p>
                        <p className="text-xs text-neutral-500">Rs. {prod.basePrice.toLocaleString()}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {/* View All Button */}
              <button 
                onClick={handleSubmit}
                className="w-full text-center px-4 py-3 mt-2 border-t text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 bg-neutral-50/50"
              >
                View all results for "{query}" &rarr;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}