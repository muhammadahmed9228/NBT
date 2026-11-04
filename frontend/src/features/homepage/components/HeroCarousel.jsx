import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function HeroCarousel({ slides }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(null);

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const showPreviousSlide = () => {
    setCurrentIndex((index) => (index - 1 + slides.length) % slides.length);
  };

  const showNextSlide = () => {
    setCurrentIndex((index) => (index + 1) % slides.length);
  };

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null || slides.length < 2) return;

    const distance = event.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(distance) > 45) {
      if (distance < 0) showNextSlide();
      else showPreviousSlide();
    }
    touchStartX.current = null;
  };

  if (!slides || slides.length === 0) return null;

  return (
    <section
      className="nbt-hero relative h-[68vh] min-h-[30rem] w-full overflow-hidden bg-nbt-espresso touch-pan-y md:h-[78vh]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {slides.map((slide, index) => (
        <div 
          key={slide._id}
          className={`nbt-hero-slide absolute inset-0 transition-opacity duration-1000 ${index === currentIndex ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          {/* Background Image with Dark Overlay */}
          <div className="absolute inset-0 z-10 bg-nbt-espresso/35"></div>
          <img src={slide.image.url} alt={slide.heading} className="h-full w-full object-cover transition-transform duration-[7000ms] ease-out" />
          
          {/* Text Content */}
          <div className="nbt-hero-content absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center text-white">
            <p className="nbt-eyebrow mb-5 text-[10px] text-nbt-champagne">NBT / New season</p>
            <h2 className="max-w-4xl text-4xl font-medium leading-[0.95] tracking-wide md:text-7xl">{slide.heading}</h2>
            {slide.subtitle && (
              <p className="mb-8 mt-5 max-w-xl text-sm leading-relaxed text-white/90 md:text-lg">{slide.subtitle}</p>
            )}
            {slide.buttonText && (
              <Link 
                to={slide.buttonUrl} 
                className="nbt-hero-cta border border-white/70 px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-white transition hover:border-white hover:bg-white hover:text-nbt-espresso"
              >
                {slide.buttonText}
              </Link>
            )}
          </div>
        </div>
      ))}

      {/* Manual Navigation Dots */}
      {slides.length > 1 && (
        <div className="nbt-hero-dots absolute bottom-7 left-1/2 z-30 flex -translate-x-1/2 space-x-2">
          {slides.map((_, index) => (
            <button 
              key={index} 
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-1.5 transition-all ${index === currentIndex ? "w-8 bg-white" : "w-3 bg-white/50"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
