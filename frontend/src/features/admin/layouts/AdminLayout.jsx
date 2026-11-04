import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import SearchBar from "../../../components/SearchBar";
import { logoutApi } from "../../auth/api/authApi";
import { logoutSuccess } from "../../auth/authSlice";
import logoImg from "../../../assets/logo.jpeg";

export default function AdminLayout() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutApi();
      dispatch(logoutSuccess());
      toast.success("Logged out successfully");
      navigate("/admin/login", { replace: true });
    } catch (error) {
      toast.error(error.message || "Logout failed");
    }
  };

  const navItems = [
    { name: "Dashboard", path: "/admin" },
    { name: "Products", path: "/admin/products" },
    { name: "Collections", path: "/admin/collections" },
    { name: "Orders", path: "/admin/orders" },
    { name: "Customers", path: "/admin/customers" },
    { name: "Homepage Config", path: "/admin/hero" },
    { name: "Dynamic Sections", path: "/admin/home-sections" },
    { name: "Announcements", path: "/admin/announcements" },
    { name: "Coupons", path: "/admin/coupons" },
    { name: "Back to Home", path: "/" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-nbt-cream md:flex-row">
      {/* Sidebar */}
      {isMobileMenuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-nbt-espresso/60 md:hidden"
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-nbt-espresso text-white shadow-2xl transition-transform duration-300 md:static md:z-auto md:w-64 md:max-w-none md:translate-x-0 md:shadow-none ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="border-b border-nbt-bronze/40 p-6">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="NBT Logo" className="h-10 w-10 object-contain" />
            <h2 className="text-lg font-bold uppercase tracking-wider text-nbt-champagne">Admin Panel</h2>
          </div>
          <p className="mt-1 text-sm text-nbt-champagne/70">
            Hello, {user?.name.split(" ")[0]}
          </p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/admin" &&
                location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-md transition text-sm font-medium ${
                  isActive
                    ? "bg-nbt-bronze text-white"
                    : "text-nbt-champagne/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="relative z-30 flex min-h-16 items-center justify-between gap-3 border-b border-nbt-champagne bg-nbt-cream px-4 py-3 sm:px-6 md:px-8">
          <button
            type="button"
            aria-label="Open admin menu"
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100 md:hidden"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6" aria-hidden="true">
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          <Link to="/admin" className="flex min-w-0 items-center gap-2 md:pointer-events-none md:no-underline">
            <img src={logoImg} alt="NBT Logo" className="h-9 w-9 object-contain md:hidden" />
            <h2 className="truncate text-base font-serif font-bold text-nbt-espresso sm:text-xl">
            Admin Control
            </h2>
          </Link>

          {/* Inject Search Bar into Admin Header */}
          <div className="mx-8 hidden max-w-lg flex-1 lg:block">
            <SearchBar isAdmin={true} />
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-4">
            <button
              type="button"
              aria-label={isMobileSearchOpen ? "Close search" : "Open search"}
              onClick={() => setIsMobileSearchOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100 lg:hidden"
            >
              {isMobileSearchOpen ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6" aria-hidden="true">
                  <path strokeLinecap="round" d="m6 6 12 12M18 6 6 18" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6" aria-hidden="true">
                  <circle cx="11" cy="11" r="6.5" />
                  <path strokeLinecap="round" d="m16 16 4.25 4.25" />
                </svg>
              )}
            </button>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-nbt-bronze transition hover:text-nbt-espresso"
            >
              Logout
            </button>
          </div>
        </header>

        {isMobileSearchOpen && (
          <div className="border-b border-nbt-champagne bg-nbt-cream px-4 py-3 lg:hidden sm:px-6">
            <SearchBar isAdmin={true} />
          </div>
        )}

        {/* Page Content */}
        <main className="min-w-0 flex-1 overflow-y-auto p-3 sm:p-5 md:p-10">
          <div className="mx-auto w-full max-w-6xl min-w-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
