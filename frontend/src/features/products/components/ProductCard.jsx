import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  // Calculate price if discount exists
  const finalPrice = product.discount
    ? product.basePrice - product.basePrice * (product.discount / 100)
    : product.basePrice;

  // Calculate how many variants this product has
  const variantCount = product.variants?.length || 0;

  return (
    <Link to={`/products/${product._id}`} className="nbt-product-card group block">
      <div className="nbt-product-media relative mb-4 aspect-[3/4] overflow-hidden bg-nbt-champagne/30">
        {/* Product Thumbnail */}
        {product.thumbnail?.url ? (
          <img
            src={product.thumbnail.url}
            alt={product.name}
            className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-wider text-neutral-400">
            No Image
          </div>
        )}

        {product.discount > 0 && (
            <div className="nbt-product-badge absolute left-3 top-3 bg-nbt-espresso px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
            -{product.discount}%
          </div>
        )}

        {/* NEW: Color Count Badge (Bottom Left) */}
        {variantCount > 1 && (
          <span className="nbt-product-variants absolute bottom-3 left-3 z-10 flex items-center gap-1.5 bg-nbt-espresso/75 px-2 py-1.5 text-[10px] font-semibold text-white backdrop-blur-sm">
            {/* Tiny color wheel indicator */}
            <span
              className="w-2.5 h-2.5 rounded-full shadow-inner"
              style={{
                background:
                  "conic-gradient(from 180deg, #ef4444, #eab308, #22c55e, #3b82f6, #a855f7, #ef4444)",
              }}
            ></span>
            {variantCount} Colors
          </span>
        )}
      </div>

      <div className="nbt-product-info">
        <h3 className="truncate text-sm font-medium text-nbt-ink transition-colors group-hover:text-nbt-bronze">
        {product.name}
        </h3>
        <div className="nbt-product-price mt-1 flex items-center space-x-2">
          <span className="text-sm font-medium text-nbt-bronze">
            Rs. {finalPrice.toLocaleString()}
          </span>
          {product.discount > 0 && (
            <span className="text-xs text-neutral-500 line-through">
              Rs. {product.basePrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
