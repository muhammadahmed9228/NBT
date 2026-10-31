import { useState, useEffect } from "react";
import { getProductsApi } from "../api/productsApi";
import ProductCard from "../components/ProductCard";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";

const PRODUCTS_PER_PAGE = 8;

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [searchParams, setSearchParams] = useSearchParams(); // Track set params so we can update the URL dynamically

  // 1. Capture BOTH search and sort from the URL on initial load
  const initialSearch = searchParams.get("search") || "";
  const initialSort = searchParams.get("sort") || "createdAt";

  const [filters, setFilters] = useState({
    search: initialSearch,
    sort: initialSort,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setPage(1);
      try {
        const response = await getProductsApi({
          ...filters,
          page: 1,
          limit: PRODUCTS_PER_PAGE,
        });
        setProducts(response.data.products || []);
        setTotalProducts(response.data.total || 0);
        setTotalPages(response.data.pages || 1);
      } catch (error) {
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [filters]);

  const handleViewMore = async () => {
    if (loadingMore || page >= totalPages) return;

    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const response = await getProductsApi({
        ...filters,
        page: nextPage,
        limit: PRODUCTS_PER_PAGE,
      });
      setProducts((currentProducts) => [
        ...currentProducts,
        ...(response.data.products || []),
      ]);
      setPage(nextPage);
    } catch (error) {
      toast.error("Failed to load more products");
    } finally {
      setLoadingMore(false);
    }
  };

  // Listen for URL changes (so if they click a navbar link while already on this page, it updates)
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlSort = searchParams.get("sort") || "createdAt";

    setFilters((prev) => {
      // Only update state if URL params actually differ from current state to prevent infinite loops
      if (prev.search !== urlSearch || prev.sort !== urlSort) {
        return { search: urlSearch, sort: urlSort };
      }
      return prev;
    });
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ ...filters, search: e.target.search.value });
  };

  // 3. Optional UX Enhancement: When the user manually changes the dropdown, update the URL so they can copy/paste it to friends!
  const handleSortDropdownChange = (e) => {
    const newSort = e.target.value;
    setFilters((prev) => ({ ...prev, sort: newSort }));

    // Update the URL without reloading the page
    searchParams.set("sort", newSort);
    setSearchParams(searchParams);
  };

  return (
    <div className="py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-3xl font-serif font-bold">All Products</h2>

        <div className="flex gap-4 w-full md:w-auto">
          <select
            className="border border-neutral-300 px-3 py-2 rounded-md focus:outline-none"
            value={filters.sort}
            onChange={handleSortDropdownChange} // <-- Use the new handler here
          >
            <option value="createdAt">Newest First</option>
            <option value="bestselling">Bestselling</option>
            <option value="featured">Featured</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-neutral-500">
          Loading products...
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          {page < totalPages && (
            <div className="flex flex-col items-center gap-2 mt-10">
              <p className="text-sm text-neutral-500">
                Showing {products.length} of {totalProducts} products
              </p>
              <button
                type="button"
                onClick={handleViewMore}
                disabled={loadingMore}
                className="px-6 py-3 border border-neutral-900 rounded-md font-medium hover:bg-neutral-900 hover:text-white transition disabled:opacity-50"
              >
                {loadingMore ? "Loading..." : "View More"}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 text-neutral-500">
          No products found.
        </div>
      )}
    </div>
  );
}
