import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getCollectionBySlugApi, getProductsApi } from "../api/productsApi";
import ProductCard from "../components/ProductCard";

const PRODUCTS_PER_PAGE = 8;

export default function CollectionPage() {
  const { slug } = useParams();
  const [collection, setCollection] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState("createdAt");

  useEffect(() => {
    const fetchCollectionAndProducts = async () => {
      setLoading(true);
      setPage(1);
      try {
        // 1. Fetch collection details by slug
        const colRes = await getCollectionBySlugApi(slug);
        const colData = colRes.data;
        setCollection(colData);

        // 2. Fetch products belonging to this collection
        const prodRes = await getProductsApi({
          collection: colData._id,
          sort,
          page: 1,
          limit: PRODUCTS_PER_PAGE,
        });
        setProducts(prodRes.data.products || []);
        setTotalProducts(prodRes.data.total || 0);
        setTotalPages(prodRes.data.pages || 1);
      } catch (error) {
        toast.error("Failed to load collection");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCollectionAndProducts();
  }, [slug, sort]);

  const handleViewMore = async () => {
    if (loadingMore || page >= totalPages || !collection) return;

    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const response = await getProductsApi({
        collection: collection._id,
        sort,
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

  if (loading) return <div className="py-20 text-center animate-pulse">Loading Collection...</div>;
  if (!collection) return <div className="py-20 text-center">Collection not found.</div>;

  return (
    <div className="pb-16">
      {/* Collection Hero Banner */}
      <div className="relative min-h-[16rem] py-12 md:py-0 md:h-80 bg-neutral-900 flex items-center justify-center text-center -mx-6 w-[calc(100%+3rem)] md:mx-0 md:w-full overflow-hidden">
        {collection.image?.url && (
          <img src={collection.image.url} alt={collection.name} className="absolute inset-0 w-full h-full object-cover opacity-40" />
        )}
        <div className="relative z-10 text-white px-4">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">{collection.name}</h1>
          {collection.description && <p className="text-lg text-neutral-200 max-w-2xl mx-auto">{collection.description}</p>}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Sorting Controls */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-neutral-200">
          <p className="text-neutral-500 font-medium">{totalProducts} Products</p>
          <select 
            className="border border-neutral-300 px-3 py-2 rounded-md focus:outline-none text-sm font-medium"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="createdAt">Newest First</option>
            <option value="bestselling">Bestselling</option>
            <option value="featured">Featured</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {/* Product Grid */}
        {products.length > 0 ? (
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
          <div className="text-center py-20 bg-neutral-50 rounded-lg">
            <h3 className="text-xl font-medium text-neutral-900 mb-2">No products found</h3>
            <p className="text-neutral-500 mb-6">We are currently updating this collection. Check back soon!</p>
            <Link to="/products" className="bg-neutral-900 text-white px-6 py-2 rounded-md">Continue Shopping</Link>
          </div>
        )}
      </div>
    </div>
  );
}