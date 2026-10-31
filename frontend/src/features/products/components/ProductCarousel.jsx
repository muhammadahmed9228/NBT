import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import ProductCard from "./ProductCard";

export default function ProductCarousel({
  products = [],
  autoScrollInterval = 4000,
  transitionDuration = 600,
}) {
  const [itemsPerView, setItemsPerView] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < 768 ? 2 : 4,
  );
  const [withTransition, setWithTransition] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouching, setIsTouching] = useState(false);

  const isJumpingRef = useRef(false);
  const timerRef = useRef(null);
  const touchStartX = useRef(null);
  const trackRef = useRef(null);

  // Responsive items-per-view tracking (2 on mobile <768px, 4 on desktop >=768px)
  useEffect(() => {
    const updateItemsPerView = () => {
      setItemsPerView(window.innerWidth < 768 ? 2 : 4);
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  // ONLY overflow if actual products length strictly exceeds items visible on screen
  const isOverflowing = Array.isArray(products) && products.length > itemsPerView;

  // Tripled list ONLY created when items overflow for infinite looping buffer
  const displayItems = useMemo(() => {
    if (!isOverflowing) return products;
    return [...products, ...products, ...products];
  }, [products, isOverflowing]);

  // Start at the beginning of the middle set (Set 2) only when overflowing
  const [currentIndex, setCurrentIndex] = useState(() =>
    isOverflowing ? products.length : 0,
  );

  // Reset index if product list or overflow status changes
  useEffect(() => {
    setWithTransition(false);
    setCurrentIndex(isOverflowing ? products.length : 0);
  }, [products.length, isOverflowing]);

  const handleNext = useCallback(() => {
    if (isJumpingRef.current || !isOverflowing) return;
    setWithTransition(true);
    setCurrentIndex((prev) => prev + 1);
  }, [isOverflowing]);

  const handlePrev = useCallback(() => {
    if (isJumpingRef.current || !isOverflowing) return;
    setWithTransition(true);
    setCurrentIndex((prev) => prev - 1);
  }, [isOverflowing]);

  // Auto-scroll every 4 seconds ONLY when overflowing (continuous right-to-left shift)
  useEffect(() => {
    if (!isOverflowing || isHovered || isTouching) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      handleNext();
    }, autoScrollInterval);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isOverflowing, isHovered, isTouching, currentIndex, autoScrollInterval, handleNext]);

  // Handle seamless infinite loop wrap-around when reaching ends of buffer
  const handleTransitionEnd = (e) => {
    if (e.target !== trackRef.current || !isOverflowing) return;

    if (currentIndex >= 2 * products.length) {
      // Passed Set 3 -> instantly reset to matching item in Set 2
      isJumpingRef.current = true;
      setWithTransition(false);
      const targetIndex = currentIndex - products.length;
      setCurrentIndex(targetIndex);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          isJumpingRef.current = false;
        });
      });
    } else if (currentIndex < products.length) {
      // Reached Set 1 -> instantly reset to matching item in Set 2
      isJumpingRef.current = true;
      setWithTransition(false);
      const targetIndex = currentIndex + products.length;
      setCurrentIndex(targetIndex);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          isJumpingRef.current = false;
        });
      });
    }
  };

  const handleTouchStart = (e) => {
    if (!isOverflowing) return;
    setIsTouching(true);
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (!isOverflowing) return;
    if (touchStartX.current !== null) {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchEndX - touchStartX.current;
      if (Math.abs(diff) > 40) {
        if (diff < 0) {
          handleNext();
        } else {
          handlePrev();
        }
      }
    }
    touchStartX.current = null;
    setIsTouching(false);
  };

  if (!products || products.length === 0) {
    return (
      <div className="py-8 text-center text-neutral-500">
        Coming soon...
      </div>
    );
  }

  // 1. NON-OVERFLOWING: Do NOT duplicate items, loop, or auto-scroll if all products fit on screen (e.g. 1-3 items)
  if (!isOverflowing) {
    return (
      <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4 md:gap-7">
        {products.map((product) => (
          <div
            key={product._id}
            className="transition-all duration-500 ease-out hover:-translate-y-1"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    );
  }

  // 2. OVERFLOWING: Automated infinite-loop carousel with chevrons and auto-scroll
  const offsetPercent = currentIndex * (100 / itemsPerView);

  return (
    <div
      className="group relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Scrollable Track Wrapper with hidden native scrollbars */}
      <div className="-mx-1.5 md:-mx-3.5 overflow-x-hidden no-scrollbar">
        <div
          ref={trackRef}
          onTransitionEnd={handleTransitionEnd}
          className="flex will-change-transform"
          style={{
            transform: `translate3d(-${offsetPercent}%, 0, 0)`,
            transition: withTransition
              ? `transform ${transitionDuration}ms cubic-bezier(0.25, 1, 0.5, 1)`
              : "none",
          }}
        >
          {displayItems.map((product, idx) => (
            <div
              key={`${product._id}-${idx}`}
              className="w-1/2 shrink-0 px-1.5 md:w-1/4 md:px-3.5"
            >
              <div className="transition-all duration-500 ease-out hover:-translate-y-1">
                <ProductCard product={product} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Left Chevron Overlay Arrow */}
      <button
        type="button"
        onClick={handlePrev}
        aria-label="Previous products"
        className="absolute left-1 top-[40%] -translate-y-1/2 z-20 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-qala-bronze text-white shadow-lg transition-all duration-300 hover:bg-qala-espresso hover:scale-110 active:scale-95 cursor-pointer md:left-2 focus:outline-none"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 md:h-6 md:w-6"
          aria-hidden="true"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Right Chevron Overlay Arrow */}
      <button
        type="button"
        onClick={handleNext}
        aria-label="Next products"
        className="absolute right-1 top-[40%] -translate-y-1/2 z-20 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-qala-bronze text-white shadow-lg transition-all duration-300 hover:bg-qala-espresso hover:scale-110 active:scale-95 cursor-pointer md:right-2 focus:outline-none"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 md:h-6 md:w-6"
          aria-hidden="true"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}
