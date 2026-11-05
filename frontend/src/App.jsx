import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ScrollToTop from "./components/ScrollToTop";
import { getMeApi } from "./features/auth/api/authApi";
import {
  setCredentials,
  logoutSuccess,
  setLoading,
} from "./features/auth/authSlice";
import {
  Disclaimer,
  PrivacyPolicy,
  RefundPolicy,
  ShippingPolicy,
  TermsAndConditions,
} from './features/policies';

import AdminHeroPage from "./features/admin/pages/AdminHeroPage";
import AdminProductsPage from "./features/admin/pages/AdminProductsPage";
import AdminOrdersPage from "./features/admin/pages/AdminOrdersPage";
import AdminCustomersPage from "./features/admin/pages/AdminCustomersPage";
import CreateProductPage from "./features/admin/pages/CreateProductPage";
import EditProductPage from "./features/admin/pages/EditProductPage";
import AdminCollectionsPage from "./features/admin/pages/AdminCollectionsPage";
import AdminAnnouncementsPage from "./features/admin/pages/AdminAnnouncementsPage";
import AdminCouponsPage from "./features/admin/pages/AdminCouponsPage";

// Layouts
import RootLayout from "./layouts/RootLayout";
import AdminLayout from "./features/admin/layouts/AdminLayout";

// Guards
import ProtectedRoute from "./features/auth/components/ProtectedRoute";
import AdminRoute from "./features/auth/components/AdminRoute";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./features/auth/pages/LoginPage";
import AdminLoginPage from "./features/auth/pages/AdminLoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage";
import ProfilePage from "./features/auth/pages/ProfilePage";
import ProductsPage from "./features/products/pages/ProductsPage";
import ProductDetailPage from "./features/products/pages/ProductDetailPage";
import CartPage from "./features/cart/pages/CartPage";
import CheckoutPage from "./features/checkout/pages/CheckoutPage";
import OrderSuccessPage from "./features/checkout/pages/OrderSuccessPage";
import DashboardPage from "./features/admin/pages/DashboardPage";
import CollectionPage from "./features/products/pages/CollectionPage";
import AdminHomeSectionsPage from "./features/admin/pages/AdminHomeSectionsPage"
import NotFoundPage from "./pages/NotFoundPage";
import ServerErrorPage from "./pages/ServerErrorPage";

export default function App() {
  const dispatch = useDispatch();

  // useEffect(() => {
  //   // Global authentication check on app load/refresh
  //   getMeApi()
  //     .then((res) => dispatch(setCredentials(res.data)))
  //     .catch(() => dispatch(logoutSuccess()))
  //     .finally(() => dispatch(setLoading(false)));
  // }, [dispatch]);

useEffect(() => {
    // Global authentication check on app load/refresh
    getMeApi()
      .then((res) => dispatch(setCredentials(res.data)))
      .catch(() => dispatch(logoutSuccess()))
      .finally(() => dispatch(setLoading(false)));

    // Netlify Badge auto-remover logic
    const purgeNetlifyBadge = () => {
      // Direct targeting: wrapper, button, element, or iframe container
      const targets = document.querySelectorAll(
        "#nl-badge, .nl-wrap, .nl-badge, iframe[src*='netlify'], iframe[id*='netlify']"
      );

      targets.forEach((el) => {
        el.style.setProperty("display", "none", "important");
        el.style.setProperty("visibility", "hidden", "important");
        el.style.setProperty("opacity", "0", "important");
        el.remove();
      });
    };

    purgeNetlifyBadge();

    // DOM Observer tab tak observe karega jab tak Netlify badge load hota hai
    const observer = new MutationObserver(() => {
      purgeNetlifyBadge();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [dispatch]);

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Customer Facing Routes */}
          <Route path="/" element={<RootLayout />}>
            <Route index element={<HomePage />} />
            <Route path="collections/:slug" element={<CollectionPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />

            {/* Policy Routes */}
            <Route path="disclaimer" element={<Disclaimer />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="refund-policy" element={<RefundPolicy />} />
            <Route path="shipping-policy" element={<ShippingPolicy />} />
            <Route path="terms-and-conditions" element={<TermsAndConditions />} />


            <Route path="products" element={<ProductsPage />} />
            <Route path="products/:id" element={<ProductDetailPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="order-success" element={<OrderSuccessPage />} />
            <Route path="500" element={<ServerErrorPage />} />

            {/* Protected Customer Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="profile" element={<ProfilePage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Admin Facing Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>

              <Route index element={<DashboardPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="customers" element={<AdminCustomersPage />} />
              <Route path="products/new" element={<CreateProductPage />} />
              <Route path="products/:id/edit" element={<EditProductPage />} />
              <Route path="hero" element={<AdminHeroPage />} />
              <Route path="collections" element={<AdminCollectionsPage />} />
              <Route path="home-sections" element={<AdminHomeSectionsPage />} />
              <Route path="announcements" element={<AdminAnnouncementsPage />} />
              <Route path="coupons" element={<AdminCouponsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
