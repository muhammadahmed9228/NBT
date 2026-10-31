import { useEffect, useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getMeApi, logoutApi } from "../features/auth/api/authApi";
import {
  setCredentials,
  logoutSuccess,
  setLoading,
} from "../features/auth/authSlice";
import { toggleCart } from "../features/cart/cartSlice";
import CartModal from "../features/cart/components/CartModal";
import logoImg from "../assets/logo.jpeg";
import SearchBar from "../components/SearchBar";
import SecondaryNavbar from "../components/SecondaryNavbar";
import WhatsAppButton from "../components/WhatsAppButton";
import Footer from "../components/Footer";
import { getPublicCollectionsApi } from "../features/products/api/productsApi";
import AnnouncementBar from "../components/AnnouncementBar";

export default function RootLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart);
  const totalCartItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  // Track the current URL route
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const isCheckoutPage = location.pathname.includes("/checkout");
  const isAuthPage = ["/login", "/register"].includes(location.pathname);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [mobileCollections, setMobileCollections] = useState([]);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  useEffect(() => {
    if (isCheckoutPage) return undefined;

    const fetchCollections = async () => {
      try {
        const response = await getPublicCollectionsApi({ limit: 100 });
        const collections = response.data?.collections || response.data || [];
        setMobileCollections(Array.isArray(collections) ? collections : []);
      } catch (error) {
        setMobileCollections([]);
      }
    };

    fetchCollections();
  }, [isCheckoutPage]);

  useEffect(() => {
    let previousScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY <= 12 || currentScrollY < previousScrollY) {
        setIsHeaderVisible(true);
      } else if (currentScrollY > previousScrollY) {
        setIsHeaderVisible(false);
        setIsMobileMenuOpen(false);
        setIsMobileSearchOpen(false);
      }
      previousScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutApi();
      dispatch(logoutSuccess());
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.search.value.trim();
    if (query) {
      navigate(`/products?search=${encodeURIComponent(query)}`);
      e.target.reset(); // Clear the input after search
    }
  };

  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-hidden">
      {!isCheckoutPage && <AnnouncementBar />}
      <header className={`${isCheckoutPage ? "hidden" : "hidden md:block"} sticky top-0 z-60 overflow-visible border-b border-qala-bronze/30 bg-qala-cream/95 backdrop-blur-md transition-transform duration-300 ${isHeaderVisible ? "translate-y-0" : "-translate-y-full"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-3 text-xl font-bold uppercase tracking-wider"
          >
            <img
              src={logoImg}
              alt="Qala Logo"
              className="h-12 w-auto object-contain"
            />
            <span className="text-lg font-semibold uppercase tracking-widest text-qala-espresso selection:bg-qala-bronze selection:text-white">
              Qala
            </span>
          </Link>
          {/* Storefront search is hidden on checkout and authentication pages. */}
          {!isCheckoutPage && !isAuthPage && (
            <div className="hidden md:flex flex-1 justify-center px-8">
              <SearchBar isAdmin={false} />
            </div>
          )}

          {!isCheckoutPage && !isAuthPage && <nav className="flex items-center space-x-6 text-sm font-medium">
            <button
              onClick={() => dispatch(toggleCart())}
              aria-label="Open cart"
              className="relative flex h-10 w-10 cursor-pointer items-center justify-center text-qala-espresso transition hover:text-qala-bronze"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h2l1.4 11.2a2 2 0 0 0 2 1.8h7.8a2 2 0 0 0 2-1.6L20.5 8H5.4" />
                <path strokeLinecap="round" d="M9 20h.01M17 20h.01" />
              </svg>
              {totalCartItems > 0 && (
                <span className="absolute right-0 top-0 min-w-4 rounded-full bg-qala-bronze px-1 text-center text-[10px] font-bold text-white">
                  {totalCartItems}
                </span>
              )}
            </button>

            {isAuthenticated ? (
              <>
                <Link to="/profile" className="hover:text-qala-bronze">
                  Hi, {user?.name.split(" ")[0]}
                </Link>
                {user?.role === "admin" && (
                  <span className="rounded bg-qala-champagne px-2 py-0.5 text-xs font-semibold text-qala-espresso">
                    Admin
                  </span>
                )}
                <button
                  onClick={handleLogout}
                  className="cursor-pointer text-neutral-500 hover:text-qala-bronze"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-qala-bronze">
                  Sign In
                </Link>
              </>
            )}
          </nav>}
        </div>
        {!isCheckoutPage && !isAuthPage && <SecondaryNavbar />}
      </header>

      {!isCheckoutPage && !isAuthPage && (
        <header
          className={`md:hidden sticky top-0 z-60 border-b border-qala-bronze/30 bg-qala-cream/95 backdrop-blur-md transition-transform duration-300 ${
            isHeaderVisible ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <div className="relative flex h-16 items-center justify-between px-4">
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen((open) => !open);
                setIsMobileSearchOpen(false);
              }}
              aria-label="Open menu"
              className="flex h-10 w-10 items-center justify-center text-qala-espresso"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>

            <Link to="/" aria-label="Qala home" className="absolute left-1/2 -translate-x-1/2">
              <img src={logoImg} alt="Qala Logo" className="h-11 w-auto object-contain" />
            </Link>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setIsMobileSearchOpen((open) => !open);
                  setIsMobileMenuOpen(false);
                }}
                aria-label={isMobileSearchOpen ? "Close search" : "Open search"}
                className="flex h-10 w-10 items-center justify-center text-qala-espresso cursor-pointer"
              >
                {isMobileSearchOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
                    <circle cx="11" cy="11" r="6.5" />
                    <path strokeLinecap="round" d="m16 16 4.25 4.25" />
                  </svg>
                )}
              </button>
              <button
                type="button"
                onClick={() => dispatch(toggleCart())}
                aria-label="Open cart"
                className="relative flex h-10 w-10 items-center justify-center text-qala-espresso"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h2l1.4 11.2a2 2 0 0 0 2 1.8h7.8a2 2 0 0 0 2-1.6L20.5 8H5.4" />
                  <path strokeLinecap="round" d="M9 20h.01M17 20h.01" />
                </svg>
                {totalCartItems > 0 && <span className="absolute right-0 top-0 min-w-4 rounded-full bg-qala-bronze px-1 text-center text-[10px] font-bold text-white">{totalCartItems}</span>}
              </button>

              {isAuthenticated ? (
                <Link to="/profile" aria-label="Open profile" className="flex h-10 w-10 items-center justify-center text-qala-espresso">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-qala-espresso text-sm" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                      <circle cx="12" cy="8" r="3.5" />
                      <path strokeLinecap="round" d="M5 20c.8-3.2 3.2-5 7-5s6.2 1.8 7 5" />
                    </svg>
                  </span>
                </Link>
              ) : (
                <Link to="/login" aria-label="Sign In" className="flex h-10 w-10 items-center justify-center text-qala-espresso">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
                    <circle cx="12" cy="8" r="3.5" />
                    <path strokeLinecap="round" d="M5 20c.8-3.2 3.2-5 7-5s6.2 1.8 7 5" />
                  </svg>
                </Link>
              )}
            </div>
          </div>

          {isMobileSearchOpen && (
            <div className="border-t border-qala-champagne bg-qala-cream px-4 py-3">
              <SearchBar isAdmin={false} onClose={() => setIsMobileSearchOpen(false)} />
            </div>
          )}

          {isMobileMenuOpen && (
            <div className="border-t border-qala-champagne bg-qala-cream px-5 py-4 shadow-lg">
              <nav className="space-y-1 text-sm font-medium">
                <p className="px-2 pb-2 text-xs font-bold uppercase tracking-wider text-neutral-400">Shop</p>
                <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className="block border-b border-neutral-100 px-2 py-3">All Products</Link>
                <Link to="/products?sort=createdAt" onClick={() => setIsMobileMenuOpen(false)} className="block border-b border-neutral-100 px-2 py-3">New Arrivals</Link>
                <Link to="/products?sort=featured" onClick={() => setIsMobileMenuOpen(false)} className="block border-b border-neutral-100 px-2 py-3">Featured</Link>
                <Link to="/products?sort=bestselling" onClick={() => setIsMobileMenuOpen(false)} className="block border-b border-neutral-100 px-2 py-3">Best Selling</Link>
                <p className="px-2 pb-1 pt-4 text-xs font-bold uppercase tracking-wider text-neutral-400">Collections</p>
                {mobileCollections.map((collection) => (
                  <Link key={collection._id} to={`/collections/${collection.slug}`} onClick={() => setIsMobileMenuOpen(false)} className="block border-b border-neutral-100 px-2 py-3">
                    {collection.name}
                  </Link>
                ))}
                
                {isAuthenticated && (
                  <div className="pt-4 pb-2">
                    <button 
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleLogout();
                      }} 
                      className="block w-full text-left font-bold text-red-500 border-b border-neutral-100 px-2 py-3 uppercase tracking-wider text-xs hover:bg-neutral-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </nav>
            </div>
          )}
        </header>
      )}

      {isAuthPage && (
        <header className="md:hidden border-b border-neutral-200 bg-white">
          <div className="flex h-16 items-center justify-center px-4">
            <Link to="/" aria-label="Qala home" className="flex items-center gap-2">
              <img src={logoImg} alt="Qala Logo" className="h-11 w-auto object-contain" />
              <span className="text-base font-semibold tracking-widest text-gray-900 uppercase">
                Qala
              </span>
            </Link>
          </div>
        </header>
      )}

      <main className={`mx-auto w-full max-w-7xl flex-1 ${isHomePage ? "p-0 md:p-6" : "p-6"}`}>
        <Outlet />
      </main>
      {/* Footer */}
      <Footer />

      {/* NEW: Global WhatsApp Floating Button */}
      {!isCheckoutPage && <WhatsAppButton />}

      <CartModal />
    </div>
  );
}
