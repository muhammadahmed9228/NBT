import { useRef, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getProductByIdApi, getProductsApi } from "../api/productsApi";
import { useDispatch } from "react-redux";
import { addToCart, closeCart } from "../../cart/cartSlice";
import ProductCard from "../components/ProductCard";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();

  // Variant Selection State
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(null);
  const [isZoomVisible, setIsZoomVisible] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [imageViewerScale, setImageViewerScale] = useState(1);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isDisclaimerExpanded, setIsDisclaimerExpanded] = useState(false);
  const touchStartX = useRef(null);

  // --- NEW: Custom Sizing States ---
  const [isCustomSizeSelected, setIsCustomSizeSelected] = useState(false);
  const [customMeasurements, setCustomMeasurements] = useState({});
  const [showSizeChart, setShowSizeChart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await getProductByIdApi(id);
        const data = response.data;
        setProduct(data);

        // Initialize defaults
        if (data.variants && data.variants.length > 0) {
          const initialVariant = data.variants[0];
          setSelectedVariant(initialVariant);

          if (initialVariant.sizes && initialVariant.sizes.length > 0) {
            setSelectedSize(initialVariant.sizes[0]);
          }

          if (initialVariant.images && initialVariant.images.length > 0) {
            setActiveImage(initialVariant.images[0].url);
          } else {
            setActiveImage(data.thumbnail?.url);
          }
        }
      } catch {
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product?._id) return;
      try {
        const params = { limit: 12 };
        if (product.collection?._id || product.collection) {
          params.collection = product.collection._id || product.collection;
        }
        const response = await getProductsApi(params);
        const list = response.data?.products || response.data || [];
        setRelatedProducts(list.filter((p) => p._id !== product._id));
      } catch {
        // non-blocking
      }
    };
    fetchRelatedProducts();
  }, [product]);

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
    if (variant.sizes && variant.sizes.length > 0) {
      setSelectedSize(variant.sizes[0]);
    } else {
      setSelectedSize(null);
    }

    // Reset custom sizing when changing color
    setIsCustomSizeSelected(false);

    if (variant.images && variant.images.length > 0) {
      setActiveImage(variant.images[0].url);
    }
    setQuantity(1);
  };

  const handleCustomMeasurementChange = (field, value) => {
    setCustomMeasurements(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddToCart = (buyNow = false) => {
    // Validation for Custom Sizes
    if (isCustomSizeSelected) {
      const requiredFields = product.customSizing?.requiredMeasurements || [];
      const missingFields = requiredFields.filter(field => !customMeasurements[field]);

      if (missingFields.length > 0) {
        toast.error(`Please provide measurements for: ${missingFields.join(', ')}`);
        return;
      }
    } else if (!selectedSize || selectedSize.stock < 1) {
      toast.error("This item is out of stock.");
      return;
    }

    // --- NEW: Pricing Logic (Surcharge applied only if custom size selected) ---
    const customSurcharge = isCustomSizeSelected ? (product.customSizing?.surcharge || 0) : 0;
    const currentBasePrice = product.basePrice + customSurcharge;
    const finalPrice = product.discount
      ? currentBasePrice - currentBasePrice * (product.discount / 100)
      : currentBasePrice;

    const cartPayload = {
      productId: product._id,
      name: product.name,
      variantId: selectedVariant._id,
      color: selectedVariant.colorName,
      // If custom, pass "CUSTOM", else pass the selected standard size
      size: isCustomSizeSelected ? "CUSTOM" : selectedSize.size,
      sku: isCustomSizeSelected ? `CUSTOM-${selectedVariant.colorName.substring(0, 3).toUpperCase()}` : selectedSize.sku,
      stock: isCustomSizeSelected ? null : selectedSize.stock,
      quantity: quantity,
      basePrice: product.basePrice,
      priceVariation: customSurcharge, // Pass surcharge as the variation
      discount: product.discount,
      image: activeImage,
      price: finalPrice,
      unitPrice: finalPrice,
      // NEW: Pass the measurements to Redux
      customMeasurements: isCustomSizeSelected ? customMeasurements : null
    };

    dispatch(addToCart(cartPayload));
    if (buyNow) {
      dispatch(closeCart());
      navigate("/checkout");
      return;
    }

    toast.success(`${product.name} added to cart!`);
  };

  if (loading) return <div className="py-20 text-center text-qala-espresso">Loading...</div>;
  if (!product) return <div className="py-20 text-center text-qala-espresso">Product not found.</div>;

  // --- NEW: Pricing Logic for Display ---
  const customSurcharge = isCustomSizeSelected ? (product.customSizing?.surcharge || 0) : 0;
  const currentBasePrice = product.basePrice + customSurcharge;
  const finalPrice = product.discount
    ? currentBasePrice - currentBasePrice * (product.discount / 100)
    : currentBasePrice;

  // --- NEW: WhatsApp URL Generation ---
  const whatsappNumber = "923235897014";
  const currentUrl = window.location.href;
  const currentSku = isCustomSizeSelected ? "CUSTOM" : (selectedSize?.sku || "N/A");
  const whatsappMessage = `Hello Qala! I have a question about ${product.name} (SKU: ${currentSku}). ${currentUrl}`;
  const encodedWhatsappMessage = encodeURIComponent(whatsappMessage);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedWhatsappMessage}`;
  const galleryImages = selectedVariant?.images?.length > 0
    ? selectedVariant.images
    : [product.thumbnail];
  const activeImageIndex = Math.max(
    0,
    galleryImages.findIndex((image) => image.url === activeImage),
  );

  const showPreviousImage = () => {
    const previousIndex = (activeImageIndex - 1 + galleryImages.length) % galleryImages.length;
    setActiveImage(galleryImages[previousIndex].url);
  };

  const showNextImage = () => {
    const nextIndex = (activeImageIndex + 1) % galleryImages.length;
    setActiveImage(galleryImages[nextIndex].url);
  };

  const handleImageMouseMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    setZoomPosition({ x, y });
  };

  const handleGalleryTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleGalleryTouchEnd = (event) => {
    if (touchStartX.current === null || galleryImages.length < 2) return;

    const distance = event.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(distance) > 45) {
      if (distance < 0) showNextImage();
      else showPreviousImage();
    }
    touchStartX.current = null;
  };

  return (
    <div className="mx-auto max-w-6xl px-2 py-5 sm:px-6 md:py-8">

      {/* NEW: Size Chart Modal */}
      {showSizeChart && product.sizeChartImage?.url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4">
          <div className="relative max-h-[calc(100vh-2rem)] w-full max-w-3xl overflow-auto border border-qala-champagne bg-qala-cream p-2 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowSizeChart(false)}
              aria-label="Close size chart"
              className="absolute right-3 top-3 z-10 flex items-center justify-center text-4xl text-black drop-shadow-[0_0_8px_rgba(255,255,255,1)] hover:scale-110 transition-transform bg-transparent border-none"
            >
              &times;
            </button>
            <img src={product.sizeChartImage.url} alt="Size Chart" className="mx-auto h-auto max-h-[calc(100vh-3rem)] w-full rounded object-contain" />
          </div>
        </div>
      )}

      {isImageViewerOpen && activeImage && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-qala-espresso/90 p-3 sm:p-6">
          <button
            type="button"
            onClick={() => {
              setIsImageViewerOpen(false);
              setImageViewerScale(1);
            }}
            aria-label="Close enlarged product image"
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-qala-cream text-xl text-qala-espresso transition hover:bg-qala-bronze hover:text-white"
          >
            &times;
          </button>
          <div className="flex h-full w-full flex-col items-center justify-center gap-4 overflow-hidden">
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto">
              <img
                src={activeImage}
                alt={`${product.name} enlarged`}
                className="max-h-full max-w-full object-contain transition-transform duration-200"
                style={{ transform: `scale(${imageViewerScale})` }}
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setImageViewerScale((scale) => Math.max(1, scale - 0.25))}
                aria-label="Zoom out"
                className="h-9 w-9 rounded-full bg-qala-cream text-lg text-qala-espresso transition hover:bg-qala-bronze hover:text-white"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => setImageViewerScale((scale) => Math.min(3, scale + 0.25))}
                aria-label="Zoom in"
                className="h-9 w-9 rounded-full bg-qala-cream text-lg text-qala-espresso transition hover:bg-qala-bronze hover:text-white"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => setImageViewerScale(1)}
                className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-qala-cream underline underline-offset-4"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 overflow-hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500 md:mb-6">
        <Link to="/" className="shrink-0 transition hover:text-qala-bronze">Home</Link>
        <span aria-hidden="true" className="text-qala-champagne">/</span>
        <Link to="/products" className="shrink-0 transition hover:text-qala-bronze">Products</Link>
        <span aria-hidden="true" className="text-qala-champagne">/</span>
        <span className="truncate text-qala-bronze">{product.name}</span>
      </nav>

      <div className="flex flex-col gap-10 md:flex-row">

        {/* Image Gallery */}
        <div className="w-full md:w-1/2">
          <div className="relative aspect-3/4 mb-4">
            <div
              className="absolute inset-0 overflow-hidden bg-qala-champagne/30"
              onMouseEnter={() => setIsZoomVisible(true)}
              onMouseLeave={() => setIsZoomVisible(false)}
              onMouseMove={handleImageMouseMove}
              onTouchStart={handleGalleryTouchStart}
              onTouchEnd={handleGalleryTouchEnd}
              onDoubleClick={() => setIsImageViewerOpen(true)}
            >
              <button
                type="button"
                onClick={() => setIsImageViewerOpen(true)}
                aria-label="Expand product image"
                className="h-full w-full cursor-zoom-in"
              >
                <img src={activeImage} alt={product.name} className="h-full w-full object-contain md:object-cover" />
              </button>
              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={showPreviousImage}
                    aria-label="Previous product image"
                    className="absolute left-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition hover:scale-110 bg-transparent border-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-8 w-8" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={showNextImage}
                    aria-label="Next product image"
                    className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition hover:scale-110 bg-transparent border-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-8 w-8" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                </>
              )}
            </div>
            {isZoomVisible && activeImage && (
              <div
                className="pointer-events-none absolute left-full top-0 z-30 ml-4 hidden aspect-3/4 w-full border border-qala-champagne bg-qala-cream bg-no-repeat shadow-xl lg:block"
                style={{
                  backgroundImage: `url(${activeImage})`,
                  backgroundSize: "200%",
                  backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                }}
              />
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img.url)}
                className={`h-24 w-20 shrink-0 border-2 ${activeImage === img.url ? "border-qala-bronze" : "border-transparent"}`}
              >
                <img src={img.url} className="w-full h-full object-cover" alt="thumbnail view" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="w-full md:w-1/2 space-y-6">

          <div>
            <h1 className="mb-2 text-3xl font-medium text-qala-espresso">{product.name}</h1>
            <div className="flex items-center space-x-3 text-xl">
              <span className="font-semibold text-qala-bronze">Rs. {finalPrice.toLocaleString()}</span>
              {product.discount > 0 && (
                <span className="text-lg text-neutral-500 line-through">Rs. {currentBasePrice.toLocaleString()}</span>
              )}
            </div>
            {isCustomSizeSelected && product.customSizing?.surcharge > 0 && (
              <p className="mt-1 text-xs font-bold text-qala-bronze">+ Rs. {product.customSizing.surcharge.toLocaleString()} Custom Sizing Surcharge Included</p>
            )}
          </div>

          <div className="text-sm leading-relaxed text-neutral-600 sm:text-base">
            <p className={`${!isDescriptionExpanded && product.description?.length > 220 ? "max-h-24 overflow-hidden md:max-h-none" : ""}`}>
              {product.description}
            </p>
            {product.description?.length > 220 && (
              <button
                type="button"
                onClick={() => setIsDescriptionExpanded((expanded) => !expanded)}
                className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-qala-bronze underline underline-offset-4 md:hidden"
              >
                {isDescriptionExpanded ? "Read Less" : "Read More"}
              </button>
            )}
          </div>

          {/* Color Selection */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-medium text-qala-espresso">Color: <span className="text-neutral-500">{selectedVariant?.colorName}</span></h3>
              <div className="flex gap-3 mb-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant._id}
                    onClick={() => handleVariantChange(variant)}
                    className={`h-10 w-10 rounded-full border-2 outline-offset-2 transition-transform focus:outline-qala-bronze ${selectedVariant?._id === variant._id ? "scale-110 border-qala-bronze" : "border-transparent"}`}
                    style={{ backgroundColor: variant.colorCode }}
                    title={variant.colorName}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-qala-espresso">Size</h3>
              <div className="flex items-center gap-4">
                {product.sizeChartImage?.url && (
                  <button onClick={() => setShowSizeChart(true)} className="text-xs font-bold text-qala-bronze underline hover:text-qala-espresso">
                    View Size Chart
                  </button>
                )}
                {!isCustomSizeSelected && (
                  <span className="rounded bg-qala-champagne/40 px-2 py-1 font-mono text-xs text-neutral-500">SKU: {selectedSize?.sku}</span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {/* Render Standard Sizes */}
              {selectedVariant?.sizes?.map((size) => {
                const isOutOfStock = size.stock < 1;
                return (
                  <button
                    key={size._id}
                    disabled={isOutOfStock}
                    onClick={() => {
                      setSelectedSize(size);
                      setIsCustomSizeSelected(false);
                    }}
                    className={`px-4 py-2 border rounded-md text-sm font-medium transition
                      ${!isCustomSizeSelected && selectedSize?._id === size._id ? "border-qala-espresso bg-qala-espresso text-white" : "border-qala-champagne text-neutral-700 hover:border-qala-bronze"}
                      ${isOutOfStock ? "cursor-not-allowed bg-qala-champagne/30 opacity-50 line-through" : ""}
                    `}
                  >
                    {size.size}
                  </button>
                );
              })}

              {/* NEW: Render CUSTOM Button if enabled by admin */}
              {product.customSizing?.enabled && (
                <button
                  onClick={() => setIsCustomSizeSelected(true)}
                  className={`px-4 py-2 border rounded-md text-sm font-bold transition tracking-wider
                    ${isCustomSizeSelected ? "border-qala-bronze bg-qala-bronze text-white shadow-md" : "border-qala-champagne bg-qala-champagne/30 text-qala-bronze hover:border-qala-bronze"}
                  `}
                >
                  CUSTOM
                </button>
              )}
            </div>

            {/* Standard Size Stock Status */}
            {!isCustomSizeSelected && selectedSize && (
              <p className={`mt-2 text-sm font-medium ${selectedSize.stock > 0 ? "text-qala-bronze" : "text-red-700"}`}>
                {selectedSize.stock > 0 ? `${selectedSize.stock} in stock` : "Out of stock"}
              </p>
            )}

            {/* NEW: Custom Sizing Input Fields */}
            {isCustomSizeSelected && product.customSizing?.requiredMeasurements && (
              <div className="mt-4 border border-qala-champagne bg-qala-champagne/20 p-4 animate-fade-in">
                <h4 className="mb-3 text-sm font-bold text-qala-espresso">Enter Your Measurements (inches)</h4>
                <div className="grid grid-cols-2 gap-4">
                  {product.customSizing.requiredMeasurements.map(field => (
                    <div key={field}>
                      <label className="mb-1 block text-xs font-medium text-qala-espresso">{field} *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 36"
                        value={customMeasurements[field] || ""}
                        onChange={(e) => handleCustomMeasurementChange(field, e.target.value)}
                        className="w-full border border-qala-champagne bg-white px-3 py-2 text-sm focus:border-qala-bronze focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-3 bg-red-50 border-l-4 border-red-500 p-3">
                  <p className="text-xs font-bold text-red-700 uppercase tracking-wide">
                    Custom orders can't be exchanged or returned.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quantity & Add to Cart */}
          <div className="flex gap-4 border-t border-qala-champagne pt-4">
            <div className="flex items-center border border-qala-champagne bg-white">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-4 py-3 transition hover:bg-qala-cream"
              >
                -
              </button>
              <span className="px-4 py-3 font-medium w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => isCustomSizeSelected ? q + 1 : Math.min(selectedSize?.stock || 1, q + 1))}
                className="px-4 py-3 transition hover:bg-qala-cream"
              >
                +
              </button>
            </div>

            <button
              onClick={() => handleAddToCart()}
              disabled={(!isCustomSizeSelected && (!selectedSize || selectedSize.stock < 1))}
              className="flex-1 bg-qala-espresso py-3 font-bold tracking-wide text-white shadow-sm transition hover:bg-qala-bronze disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add to Cart
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleAddToCart(true)}
            disabled={(!isCustomSizeSelected && (!selectedSize || selectedSize.stock < 1))}
            className="w-full border border-qala-espresso px-4 py-2.5 text-sm font-semibold tracking-wide text-qala-espresso transition hover:bg-qala-espresso hover:text-white disabled:cursor-not-allowed disabled:opacity-50 md:w-auto md:min-w-40"
          >
            Buy it now
          </button>

          {/* NEW: WhatsApp Inquiry Button */}
          <div className="pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 border border-qala-bronze px-4 py-2.5 text-sm font-semibold text-qala-bronze transition-colors hover:bg-qala-bronze hover:text-white md:w-auto md:min-w-56"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.878-.788-1.472-1.761-1.645-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
              </svg>
              Ask about this piece on WhatsApp
            </a>
          </div>

          {/* NEW: Disclaimer */}
          <div className="mt-6 border-t border-qala-champagne pt-4">
            <button
              onClick={() => setIsDisclaimerExpanded(!isDisclaimerExpanded)}
              className="flex w-full items-center justify-between py-2 text-sm font-semibold text-qala-espresso hover:text-qala-bronze"
            >
              <span>Disclaimer</span>
              <span className="text-lg leading-none">{isDisclaimerExpanded ? "−" : "+"}</span>
            </button>
            {isDisclaimerExpanded && (
              <p className="mt-2 text-xs leading-relaxed text-neutral-600 animate-fade-in">
                Disclaimer: Product color may vary slightly due to photographic lighting sources or monitor settings.
              </p>
            )}
          </div>

        </div>
      </div>

      {/* Related Products Carousel */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 border-t border-qala-champagne/70 pt-10">
          <div className="mb-6">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-qala-bronze">
              Curated for you
            </p>
            <h2 className="text-3xl font-medium text-qala-espresso md:text-4xl">
              You May Also Like
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
            {relatedProducts.slice(0, 4).map((relatedProduct) => (
              <ProductCard key={relatedProduct._id} product={relatedProduct} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}