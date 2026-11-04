import { Fragment, useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getPublicHeroSlidesApi } from "../features/homepage/api/homeApi";
import { getPublicHomeSectionsApi } from "../features/admin/api/adminApi";
import { getProductsApi, getPublicCollectionsApi } from "../features/products/api/productsApi";
import HeroCarousel from "../features/homepage/components/HeroCarousel";
import ProductCarousel from "../features/products/components/ProductCarousel";
import HomePageSkeleton from "../components/HomePageSkeleton";

export default function HomePage() {
  const [slides, setSlides] = useState([]);
  const [collections, setCollections] = useState([]);
  const [dynamicSections, setDynamicSections] = useState([]); // Array of { sectionData, products }
  const [collectionPosition, setCollectionPosition] = useState(0);
  const [visibleCollectionCount, setVisibleCollectionCount] = useState(3);
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const collectionTouchStartX = useRef(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        // 1. Fetch foundational data
        const [slidesRes, collectionsRes, sectionsRes] = await Promise.all([
          getPublicHeroSlidesApi({ limit: 10 }),
          getPublicCollectionsApi({ limit: 10 }),
          getPublicHomeSectionsApi({ limit: 10 }),
        ]);

        setSlides(slidesRes.data.slides || slidesRes.data);
        setCollections(collectionsRes.data.collections || collectionsRes.data);

        // 2. Fetch products for EACH dynamic section dynamically!
        const sectionsData = sectionsRes.data.sections || sectionsRes.data;
        const populatedSections = await Promise.all(
          sectionsData.map(async (sec) => {
            let params = { limit: 12 }; // Fetch 12 items to allow carousel navigation

            // Map the section criteria to our robust product sorting API
            if (sec.criteria === "newest") params.sort = "createdAt";
            if (sec.criteria === "bestselling") params.sort = "bestselling";
            if (sec.criteria === "featured") params.sort = "featured";
            if (sec.criteria === "collection" && sec.collectionRef)
              params.collection =
                sec.collectionRef._id || sec.collectionRef;

            const pRes = await getProductsApi(params);
            return { ...sec, products: pRes.data.products || pRes.data };
          }),
        );

        setDynamicSections(populatedSections);
      } catch (error) {
        console.error("Failed to load homepage data");
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  useEffect(() => {
    const updateCollectionLayout = () => {
      const nextVisibleCount = window.innerWidth < 768 ? 2 : 3;
      setVisibleCollectionCount(nextVisibleCount);
      setCollectionPosition((position) =>
        Math.min(position, Math.max(0, collections.length - nextVisibleCount)),
      );
    };

    const handleScrollTop = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    updateCollectionLayout();
    window.addEventListener("resize", updateCollectionLayout);
    window.addEventListener("scroll", handleScrollTop, { passive: true });
    return () => {
      window.removeEventListener("resize", updateCollectionLayout);
      window.removeEventListener("scroll", handleScrollTop);
    };
  }, [collections.length]);

  const handleCollectionTouchStart = (event) => {
    collectionTouchStartX.current = event.touches[0].clientX;
  };

  const handleCollectionTouchEnd = (event) => {
    if (collectionTouchStartX.current === null || collections.length < 2) return;

    const distance =
      event.changedTouches[0].clientX - collectionTouchStartX.current;
    if (Math.abs(distance) > 45) {
      if (distance < 0) {
        setCollectionPosition((position) =>
          Math.min(collectionMaxPosition, position + 1),
        );
      } else {
        setCollectionPosition((position) => Math.max(0, position - 1));
      }
    }
    collectionTouchStartX.current = null;
  };

  const collectionMaxPosition = Math.max(
    0,
    collections.length - visibleCollectionCount,
  );
  const visibleCollections = collections.slice(
    collectionPosition,
    collectionPosition + visibleCollectionCount + 1,
  );

  const collectionSection = collections.length > 0 && (
    <section className="nbt-collection-feature mx-auto max-w-7xl px-1 pt-1 md:px-4 md:pt-6">
      <div className="mb-4 flex items-end justify-between gap-3 md:mb-6">
        <div>
          <p className="nbt-eyebrow mb-2">
            Explore the edit
          </p>
          <h2 className="text-3xl font-medium text-nbt-espresso md:text-4xl">
            Shop by Collection
          </h2>
        </div>
      </div>
      <div className="relative">
        <div
          className="nbt-collection-track flex gap-4 overflow-hidden touch-pan-y md:gap-6"
          onTouchStart={handleCollectionTouchStart}
          onTouchEnd={handleCollectionTouchEnd}
        >
          {visibleCollections.map((col) => (
            <div
              key={col._id}
              className="nbt-collection-card group relative h-72 min-w-[calc(50%-0.5rem)] overflow-hidden bg-nbt-espresso md:h-[26rem] md:min-w-[calc(33.333%-1rem)] md:flex-1"
            >
              {col.image?.url && (
                <img
                  src={col.image.url}
                  alt={col.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 transition duration-700 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
              <div className="nbt-collection-card-content absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                <h3 className="mb-4 text-3xl font-medium text-white md:text-4xl">
                  {col.name}
                </h3>
                <Link
                  to={`/collections/${col.slug}`}
                  className="nbt-outline-cta border-white/70 px-5 py-2 text-[10px] text-white hover:bg-white hover:text-nbt-espresso md:px-6"
                >
                  See More
                </Link>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            setCollectionPosition((position) => Math.max(0, position - 1))
          }
          disabled={collectionPosition === 0}
          aria-label="Previous collection"
          className="absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-nbt-bronze bg-nbt-cream text-nbt-bronze transition hover:bg-nbt-bronze hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m15 18-6-6 6-6"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={() =>
            setCollectionPosition((position) =>
              Math.min(collectionMaxPosition, position + 1),
            )
          }
          disabled={collectionPosition >= collectionMaxPosition}
          aria-label="Next collection"
          className="absolute right-0 top-1/2 z-10 flex h-10 w-10 translate-x-1/2 -translate-y-1/2 items-center justify-center border border-nbt-bronze bg-nbt-cream text-nbt-bronze transition hover:bg-nbt-bronze hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m9 18 6-6-6-6"
            />
          </svg>
        </button>
      </div>
    </section>
  );
  const collectionInsertIndex = Math.ceil(dynamicSections.length / 2);

  if (loading) return <HomePageSkeleton />;

  return (
    <div className="nbt-home-page space-y-6 pb-12 md:space-y-10 md:pb-16">
      <div>
        <HeroCarousel slides={slides} />
      </div>

      {/* Render Dynamic Sections created by Admin */}
      {dynamicSections.map((section, sectionIndex) => {
        const viewMorePath =
          section.criteria === "collection" && section.collectionRef
            ? `/collections/${section.collectionRef.slug}`
            : `/products?sort=${
                section.criteria === "featured"
                  ? "featured"
                  : section.criteria === "bestselling"
                  ? "bestselling"
                  : "createdAt"
              }`;

        return (
          <Fragment key={section._id}>
            <section className="nbt-home-section mx-auto max-w-7xl border-t border-nbt-champagne/70 px-2 py-5 md:px-4 md:py-8">
              <div className="nbt-section-heading mb-4 flex flex-col items-start gap-3 md:mb-6 md:flex-row md:items-end md:justify-between">
                <div className="w-full text-left">
                  <p className="nbt-eyebrow mb-2">
                    The NBT edit
                  </p>
                  <h2 className="mb-1 text-3xl font-medium text-nbt-espresso md:text-4xl">
                    {section.title}
                  </h2>
                  {section.subtitle && (
                    <p className="max-w-xl text-sm leading-relaxed text-neutral-600 md:text-base">
                      {section.subtitle}
                    </p>
                  )}
                </div>
                <Link
                  to={viewMorePath}
                  className="nbt-outline-cta inline-flex h-fit shrink-0 items-center justify-center self-end border-nbt-espresso px-5 py-2 text-[10px] text-nbt-espresso md:self-auto md:px-7"
                >
                  View More
                </Link>
              </div>

              <ProductCarousel products={section.products || []} />
            </section>
            {sectionIndex + 1 === collectionInsertIndex && collectionSection}
          </Fragment>
        );
      })}

      {dynamicSections.length === 0 && collectionSection}

      {/* Scroll to Top Button (Placed above WhatsApp icon with smooth fade) */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-24 right-7 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-nbt-espresso text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-nbt-bronze ${
          showScrollTop
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        aria-label="Scroll to top"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 15l7-7 7 7"
          />
        </svg>
      </button>
    </div>
  );
}