import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const inMemoryScrollPositions = new Map();

function getScrollKey(loc) {
  return `${loc.pathname}${loc.search}`;
}

function savePosition(key, scrollY) {
  if (!key) return;
  inMemoryScrollPositions.set(key, scrollY);
  try {
    sessionStorage.setItem(`nbt_scroll_${key}`, String(scrollY));
  } catch {
    // ignore
  }
}

function getPosition(key) {
  if (!key) return 0;
  if (inMemoryScrollPositions.has(key)) {
    return inMemoryScrollPositions.get(key);
  }
  try {
    const saved = sessionStorage.getItem(`nbt_scroll_${key}`);
    if (saved !== null) {
      const num = Number(saved);
      return Number.isNaN(num) ? 0 : num;
    }
  } catch {
    // ignore
  }
  return 0;
}

function forceScrollTo(top = 0) {
  window.scrollTo({ top, left: 0, behavior: "instant" });
  document.documentElement.scrollTop = top;
  document.body.scrollTop = top;
  if (document.scrollingElement) {
    document.scrollingElement.scrollTop = top;
  }
}

export default function ScrollToTop() {
  const location = useLocation();
  const navType = useNavigationType();
  const currentKeyRef = useRef(getScrollKey(location));
  const isProgrammaticScrollRef = useRef(false);

  currentKeyRef.current = getScrollKey(location);

  // Disable native browser scroll restoration immediately
  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // Save scroll position on user scrolling
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (isProgrammaticScrollRef.current) return;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          savePosition(currentKeyRef.current, window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Handle route change
  useLayoutEffect(() => {
    const currentKey = getScrollKey(location);
    isProgrammaticScrollRef.current = true;

    if (navType === "PUSH" || navType === "REPLACE") {
      // 1. New navigation (e.g. clicking footer links, navbar links, products):
      // ALWAYS force scroll to the very top immediately
      forceScrollTo(0);

      // Re-apply in next frames to guarantee top position across async DOM mounts
      const frame1 = requestAnimationFrame(() => {
        forceScrollTo(0);
        const frame2 = requestAnimationFrame(() => {
          forceScrollTo(0);
          isProgrammaticScrollRef.current = false;
        });
        return () => cancelAnimationFrame(frame2);
      });

      const timer = setTimeout(() => {
        forceScrollTo(0);
        isProgrammaticScrollRef.current = false;
      }, 50);

      return () => {
        cancelAnimationFrame(frame1);
        clearTimeout(timer);
      };
    }

    if (navType === "POP") {
      // 2. Browser Back / Forward button:
      const savedY = getPosition(currentKey);

      if (savedY <= 0) {
        forceScrollTo(0);
        const timer = setTimeout(() => {
          forceScrollTo(0);
          isProgrammaticScrollRef.current = false;
        }, 50);
        return () => clearTimeout(timer);
      }

      // If user was scrolled down, restore position once content is available
      let restored = false;
      const attemptRestore = () => {
        if (restored) return;
        const maxScroll =
          document.documentElement.scrollHeight - window.innerHeight;
        if (maxScroll >= savedY * 0.9) {
          forceScrollTo(savedY);
          restored = true;
          isProgrammaticScrollRef.current = false;
        }
      };

      attemptRestore();

      const observer = new MutationObserver(() => {
        attemptRestore();
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      const startTime = Date.now();
      const intervalId = setInterval(() => {
        if (restored || Date.now() - startTime > 2500) {
          clearInterval(intervalId);
          observer.disconnect();
          if (!restored) {
            forceScrollTo(0);
          }
          isProgrammaticScrollRef.current = false;
          return;
        }
        attemptRestore();
      }, 50);

      return () => {
        clearInterval(intervalId);
        observer.disconnect();
      };
    }

    forceScrollTo(0);
    isProgrammaticScrollRef.current = false;
  }, [location.pathname, location.search, navType]);

  return null;
}
