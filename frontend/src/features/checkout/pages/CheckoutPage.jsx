import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { clearCart } from "../../cart/cartSlice";
import { toggleCart } from "../../cart/cartSlice";
import { calculateItemPrice } from "../../cart/cartPricing";
import { createOrderApi, validateCouponApi } from "../api/checkoutApi";
import logoImg from "../../../assets/logo.jpeg";
import { Turnstile } from '@marsidev/react-turnstile';
import { applyCoupon, removeCoupon } from "../../cart/cartSlice";

export default function CheckoutPage() {
  const { items, coupon } = useSelector((state) => state.cart);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    postalCode: "",
    country: "Pakistan",
    newsOffers: false,
    saveInfo: false,
    paymentMethod: "COD",
    billingOption: "same",
    billingAddress: {
      address: "",
      apartment: "",
      city: "",
      postalCode: "",
      country: "Pakistan",
    },
    notes: "",
  });
  const [couponInput, setCouponInput] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [isMobileSummaryExpanded, setIsMobileSummaryExpanded] = useState(false);

  // Pre-fill customer data if logged in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

  if (items.length === 0 && !isSuccess) {
  return <Navigate to="/cart" replace />;
}

  const subtotal = items.reduce((total, item) => total + ((item.price ?? item.unitPrice ?? calculateItemPrice(item)) * item.quantity), 0);
  
  let discount = 0;
  if (coupon) {
    if (typeof coupon.discountAmount === 'number') {
      discount = coupon.discountAmount;
    } else if (coupon.discountType === "percentage") {
      discount = (subtotal * coupon.discountValue) / 100;
    } else {
      discount = coupon.discountValue;
    }
  }

  const shippingCost = 250; // Fixed flat rate for V1 COD as defined in backend
  
  let paymentDiscount = 0;
  if (formData.paymentMethod === "BANK_TRANSFER") {
    paymentDiscount = 100;
  }

  const total = Math.max(0, subtotal - discount - paymentDiscount) + shippingCost;

  const handleApplyCoupon = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!couponInput.trim()) return;
    // Prevent applying the same coupon twice.
    if (coupon && coupon.code?.toUpperCase() === couponInput.trim().toUpperCase()) {
      toast.error('Coupon already applied');
      return;
    }
    setIsValidatingCoupon(true);
    try {
      const res = await validateCouponApi(couponInput, subtotal);
      dispatch(applyCoupon(res.data));
      setCouponInput("");
      toast.success("Coupon applied successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid coupon code");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      if (name.startsWith("billingAddress.")) {
        const field = name.split(".")[1];
        return {
          ...prev,
          billingAddress: { ...prev.billingAddress, [field]: value },
        };
      }
      return {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!turnstileToken) {
      toast.error("Please complete the security check.");
      return;
    }
    setSubmitting(true);

    const payload = {
      customerInfo: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      },
      shippingInfo: {
        address: formData.address + (formData.apartment ? ` ${formData.apartment}` : ""),
        city: formData.city,
        postalCode: formData.postalCode,
        notes: formData.notes,
      },
      items: items, // Redux cart items already match the required structure
      turnstileToken,
      couponCode: coupon?.code || null,
      paymentMethod: formData.paymentMethod,
    };

    try {
  const response = await createOrderApi(payload);
  
  setIsSuccess(true); // 1. Bypass the empty cart redirect
  dispatch(clearCart()); // 2. Clear the cart safely
  toast.success("Order placed successfully!");
  
  navigate("/order-success", { 
    state: { orderNumber: response.data.orderNumber } 
  });
} catch (error) {
  toast.error(error.message || "Failed to place order.");
} finally {
  setSubmitting(false);
}
  };

  return (
    <div className="min-h-screen bg-qala-cream">
      <header className="sticky top-0 z-40 border-b border-qala-champagne bg-qala-cream/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" aria-label="Qala home" className="flex items-center gap-2">
            <img src={logoImg} alt="Qala Logo" className="h-10 w-auto object-contain" />
            <span className="hidden text-sm font-semibold uppercase tracking-[0.2em] text-qala-espresso sm:inline">Qala</span>
          </Link>

          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-qala-espresso sm:gap-5">
            <button
              type="button"
              onClick={() => dispatch(toggleCart())}
              aria-label="Open cart"
              className="relative flex h-9 w-9 items-center justify-center text-qala-espresso transition hover:text-qala-bronze"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h2l1.4 11.2a2 2 0 0 0 2 1.8h7.8a2 2 0 0 0 2-1.6L20.5 8H5.4" />
                <path strokeLinecap="round" d="M9 20h.01M17 20h.01" />
              </svg>
              {items.length > 0 && <span className="absolute right-0 top-0 min-w-4 rounded-full bg-qala-bronze px-1 text-center text-[9px] font-bold text-white">{items.reduce((total, item) => total + item.quantity, 0)}</span>}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-8">
      <h2 className="text-3xl font-serif font-bold mb-8">Checkout</h2>
      
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Checkout Form */}
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Contact Information */}
            <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Contact</h3>
                {!isAuthenticated && (
                  <Link to="/login" className="text-sm text-qala-bronze hover:underline">Sign in</Link>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <input type="text" placeholder="Email or mobile phone number" name="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-qala-bronze focus:border-qala-bronze" />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input type="checkbox" id="newsOffers" name="newsOffers" checked={formData.newsOffers} onChange={handleChange} className="w-4 h-4 text-qala-bronze rounded focus:ring-qala-bronze" />
                  <label htmlFor="newsOffers" className="text-sm text-neutral-600">Email me with news and offers</label>
                </div>
              </div>
            </div>

            {/* Delivery/ Shipping Address */}
            <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm mt-8">
              <h3 className="text-xl font-semibold mb-4">Delivery</h3>
              <div className="space-y-3 flex flex-col">
                <div>
                  <select name="country" value={formData.country} onChange={handleChange} className="w-full px-4 py-3 border border-neutral-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-qala-bronze focus:border-qala-bronze">
                    <option value="Pakistan">Pakistan</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input type="text" placeholder="First name (optional)" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-qala-bronze focus:border-qala-bronze" />
                  <input type="text" placeholder="Last name" name="lastName" className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-qala-bronze focus:border-qala-bronze" />
                </div>
                <div>
                  <input type="text" placeholder="Address" name="address" required value={formData.address} onChange={handleChange} className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-qala-bronze focus:border-qala-bronze" />
                </div>
                <div>
                  <input type="text" placeholder="Apartment, suite, etc. (optional)" name="apartment" value={formData.apartment} onChange={handleChange} className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-qala-bronze focus:border-qala-bronze" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input type="text" placeholder="City" name="city" required value={formData.city} onChange={handleChange} className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-qala-bronze focus:border-qala-bronze" />
                  <input type="text" placeholder="Postal code (optional)" name="postalCode" value={formData.postalCode} onChange={handleChange} className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-qala-bronze focus:border-qala-bronze" />
                </div>
                <div>
                  <input type="text" placeholder="Phone" name="phone" required value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-qala-bronze focus:border-qala-bronze" />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input type="checkbox" id="saveInfo" name="saveInfo" checked={formData.saveInfo} onChange={handleChange} className="w-4 h-4 text-qala-bronze rounded focus:ring-qala-bronze" />
                  <label htmlFor="saveInfo" className="text-sm text-neutral-600">Save this information for next time</label>
                </div>
              </div>
            </div>

            {/* Shipping method */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Shipping method</h3>
              <div className="bg-neutral-50 p-4 border border-qala-bronze/50 rounded-md flex justify-between items-center bg-blue-50/30">
                <span className="text-sm text-neutral-700">Flat Rate</span>
                <span className="text-sm font-semibold">Rs 250.00</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-2">Payment</h3>
              <p className="text-xs text-neutral-500 mb-4">All transactions are secure and encrypted.</p>
              
              <div className="bg-white border border-neutral-200 rounded-md overflow-hidden">
                <label className={`flex items-center space-x-3 p-4 border-b border-neutral-200 cursor-pointer ${formData.paymentMethod === 'COD' ? 'bg-neutral-50/50' : ''}`}>
                  <input type="radio" name="paymentMethod" value="COD" checked={formData.paymentMethod === 'COD'} onChange={handleChange} className="w-4 h-4 text-qala-bronze focus:ring-qala-bronze" />
                  <span className="font-medium text-sm">Cash on Delivery (COD)</span>
                </label>
                
                <div className="flex flex-col">
                  <label className={`flex items-center space-x-3 p-4 cursor-pointer ${formData.paymentMethod === 'BANK_TRANSFER' ? 'bg-blue-50 border-b border-blue-100' : ''}`}>
                    <input type="radio" name="paymentMethod" value="BANK_TRANSFER" checked={formData.paymentMethod === 'BANK_TRANSFER'} onChange={handleChange} className="w-4 h-4 text-qala-bronze focus:ring-qala-bronze" />
                    <span className="font-medium text-sm">Pay Online/Bank And Get Rs,100 OFF</span>
                  </label>
                  {formData.paymentMethod === 'BANK_TRANSFER' && (
                    <div className="bg-neutral-50 p-5 text-sm text-neutral-700 leading-relaxed border-t border-neutral-200">
                      Bank: Alfalah Bank<br />
                      Account Title: Real Beauty<br />
                      Account Number: 05921010147579<br />
                      Share Screenshot Back of Payment on this number: 03402222997
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Billing address */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Billing address</h3>
              <div className="bg-white border border-neutral-200 rounded-md overflow-hidden">
                <label className={`flex items-center space-x-3 p-4 border-b border-neutral-200 cursor-pointer ${formData.billingOption === 'same' ? 'bg-neutral-50/50' : ''}`}>
                  <input type="radio" name="billingOption" value="same" checked={formData.billingOption === 'same'} onChange={handleChange} className="w-4 h-4 text-qala-bronze focus:ring-qala-bronze" />
                  <span className="font-medium text-sm">Same as shipping address</span>
                </label>
                
                <div className="flex flex-col">
                  <label className={`flex items-center space-x-3 p-4 cursor-pointer ${formData.billingOption === 'different' ? 'bg-blue-50 border-b border-blue-100' : ''}`}>
                    <input type="radio" name="billingOption" value="different" checked={formData.billingOption === 'different'} onChange={handleChange} className="w-4 h-4 text-qala-bronze focus:ring-qala-bronze" />
                    <span className="font-medium text-sm">Use a different billing address</span>
                  </label>
                  {formData.billingOption === 'different' && (
                    <div className="bg-neutral-50 p-5 space-y-3 flex flex-col border-t border-neutral-200">
                      <div>
                        <select name="billingAddress.country" value={formData.billingAddress.country} onChange={handleChange} className="w-full px-4 py-3 border border-neutral-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-qala-bronze focus:border-qala-bronze">
                          <option value="Pakistan">Pakistan</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input type="text" placeholder="First name (optional)" className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-qala-bronze focus:border-qala-bronze" />
                        <input type="text" placeholder="Last name" className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-qala-bronze focus:border-qala-bronze" />
                      </div>
                      <div>
                        <input type="text" placeholder="Address" name="billingAddress.address" required value={formData.billingAddress.address} onChange={handleChange} className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-qala-bronze focus:border-qala-bronze" />
                      </div>
                      <div>
                        <input type="text" placeholder="Apartment, suite, etc. (optional)" name="billingAddress.apartment" value={formData.billingAddress.apartment} onChange={handleChange} className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-qala-bronze focus:border-qala-bronze" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input type="text" placeholder="City" name="billingAddress.city" required value={formData.billingAddress.city} onChange={handleChange} className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-qala-bronze focus:border-qala-bronze" />
                        <input type="text" placeholder="Postal code (optional)" name="billingAddress.postalCode" value={formData.billingAddress.postalCode} onChange={handleChange} className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-qala-bronze focus:border-qala-bronze" />
                      </div>
                      <div>
                        <input type="text" placeholder="Phone (optional)" className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-qala-bronze focus:border-qala-bronze" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Order Summary (Visible on mobile screens < lg) */}
            <div className="block lg:hidden bg-white rounded-lg border border-neutral-200 p-4 sm:p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-neutral-900">Order Summary</h3>
                  <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full font-medium">
                    {items.reduce((total, item) => total + item.quantity, 0)} {items.reduce((total, item) => total + item.quantity, 0) === 1 ? "item" : "items"}
                  </span>
                </div>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setIsMobileSummaryExpanded(!isMobileSummaryExpanded)}
                    className="text-xs font-semibold text-qala-bronze hover:underline flex items-center gap-1 focus:outline-none"
                  >
                    <span>{isMobileSummaryExpanded ? "Show 1 item" : `View all (${items.length})`}</span>
                    <svg
                      className={`w-4 h-4 transform transition-transform duration-200 ${isMobileSummaryExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Items List (1 item default vs expanded scrollable list) */}
              {isMobileSummaryExpanded ? (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-neutral-100">
                  {items.map((item) => (
                    <div key={item.sku || `${item.productId}-${item.color}-${item.size}`} className="flex gap-3 text-sm pt-3 first:pt-0">
                      <div className="relative flex-shrink-0">
                        <Link to={`/products/${item.productId}`}>
                          <img src={item.image} alt={item.name} className="w-16 h-20 object-cover rounded border border-neutral-200" />
                        </Link>
                        <span className="absolute -top-2 -right-2 bg-neutral-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link to={`/products/${item.productId}`}>
                          <p className="font-semibold text-neutral-900 truncate hover:text-qala-bronze">{item.name}</p>
                        </Link>
                        <p className="text-neutral-500 text-xs mt-0.5">{item.color} / {item.size}</p>
                        <p className="font-medium text-neutral-900 mt-1">Rs. {(calculateItemPrice(item) * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  {items[0] && (
                    <div className="flex gap-3 text-sm">
                      <div className="relative flex-shrink-0">
                        <Link to={`/products/${items[0].productId}`}>
                          <img src={items[0].image} alt={items[0].name} className="w-16 h-20 object-cover rounded border border-neutral-200" />
                        </Link>
                        <span className="absolute -top-2 -right-2 bg-neutral-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                          {items[0].quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link to={`/products/${items[0].productId}`}>
                          <p className="font-semibold text-neutral-900 truncate hover:text-qala-bronze">{items[0].name}</p>
                        </Link>
                        <p className="text-neutral-500 text-xs mt-0.5">{items[0].color} / {items[0].size}</p>
                        <p className="font-medium text-neutral-900 mt-1">Rs. {(calculateItemPrice(items[0]) * items[0].quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setIsMobileSummaryExpanded(true)}
                      className="mt-2 text-xs text-neutral-500 hover:text-qala-bronze underline block text-left"
                    >
                      +{items.length - 1} more {items.length - 1 === 1 ? "item" : "items"} in your order (Click to view)
                    </button>
                  )}
                </div>
              )}

              {/* Price Breakdown */}
              <div className="border-t border-neutral-200 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span>Rs. {subtotal.toLocaleString()}</span>
                </div>

                {coupon && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <div className="flex items-center gap-2">
                      <span>Discount ({coupon.code})</span>
                      <button 
                        type="button"
                        onClick={() => dispatch(removeCoupon())}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                    <span>-Rs. {discount.toLocaleString()}</span>
                  </div>
                )}

                {paymentDiscount > 0 && (
                  <div className="flex justify-between text-blue-600 font-medium">
                    <span>Bank Transfer Promo</span>
                    <span>-Rs. {paymentDiscount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-neutral-600">
                  <span>Shipping</span>
                  <span>Rs. {shippingCost.toLocaleString()}</span>
                </div>

                <div className="border-t border-neutral-200 pt-2 flex justify-between font-bold text-lg text-neutral-900">
                  <span>Total</span>
                  <span>Rs. {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Coupon Code Input for Mobile */}
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon Code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleApplyCoupon(e);
                    }
                  }}
                  className="w-full border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 outline-none rounded-md focus:bg-white focus:border-qala-bronze"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={isValidatingCoupon || !couponInput.trim()}
                  className="bg-neutral-900 px-4 py-2 text-sm font-medium text-white rounded-md transition hover:bg-neutral-800 disabled:opacity-50 flex-shrink-0"
                >
                  {isValidatingCoupon ? "Applying..." : "Apply"}
                </button>
              </div>
            </div>

            <div className="py-2 flex justify-center">
              <Turnstile 
                siteKey="0x4AAAAAAEyCT9dIF1IcOxCK" 
                onSuccess={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken(null)}
              />
            </div>

            <button type="submit" disabled={submitting} className="w-full bg-qala-espresso text-white py-4 rounded-md hover:bg-[#126298] transition font-bold text-lg disabled:opacity-50">
              {submitting ? "Processing Order..." : "Complete order"}
            </button>
          </form>
        </div>

        {/* Order Summary (Desktop Sidebar only) */}
        <div className="hidden lg:block lg:w-96 h-fit bg-neutral-50 border-l border-neutral-200 p-6 space-y-4">
          <h3 className="text-lg font-bold border-b border-neutral-200 pb-3">Order Summary</h3>
          <div className="space-y-4 mb-4 max-h-60 overflow-y-auto pr-2">
            {items.map((item) => (
              <div key={item.sku} className="flex gap-3 text-sm">
                <div className="relative">
                  <Link to={`/products/${item.productId}`}>
                    <img src={item.image} alt={item.name} className="w-16 h-20 object-cover rounded border border-neutral-200 hover:opacity-80 transition" />
                  </Link>
                  <span className="absolute -top-2 -right-2 bg-neutral-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{item.quantity}</span>
                </div>
                <div className="flex-1">
                  <Link to={`/products/${item.productId}`}>
                    <p className="font-semibold line-clamp-1 hover:text-qala-bronze">{item.name}</p>
                  </Link>
                  <p className="text-neutral-500 text-xs">{item.color} / {item.size}</p>
                  <p className="font-medium mt-1">Rs. {(calculateItemPrice(item) * item.quantity).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-neutral-600 border-t border-neutral-200 pt-4">
            <span>Subtotal</span>
            <span>Rs. {subtotal.toLocaleString()}</span>
          </div>

          {coupon && (
            <div className="flex justify-between text-green-600 font-medium">
              <div className="flex items-center gap-2">
                <span>Discount ({coupon.code})</span>
                <button 
                  onClick={() => dispatch(removeCoupon())}
                  className="text-xs text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
              <span>-Rs. {discount.toLocaleString()}</span>
            </div>
          )}

          {paymentDiscount > 0 && (
            <div className="flex justify-between text-blue-600 font-medium">
              <span>Bank Transfer Promo</span>
              <span>-Rs. {paymentDiscount.toLocaleString()}</span>
            </div>
          )}

          <div className="flex justify-between text-neutral-600">
            <span>Shipping</span>
            <span>Rs. {shippingCost.toLocaleString()}</span>
          </div>
          <div className="border-t border-neutral-200 pt-3 flex justify-between font-bold text-xl">
            <span>Total</span>
            <span>Rs. {total.toLocaleString()}</span>
          </div>

          {/* Coupon Input Form */}
          <form onSubmit={handleApplyCoupon} className="mt-4 flex gap-2">
            <input
              type="text"
              placeholder="Coupon Code"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              className="w-full border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none rounded-md"
            />
            <button
              type="submit"
              disabled={isValidatingCoupon || !couponInput.trim()}
              className="bg-neutral-900 px-4 py-2 text-sm font-medium text-white rounded-md transition hover:bg-neutral-800 disabled:opacity-50"
            >
              {isValidatingCoupon ? "Applying..." : "Apply"}
            </button>
          </form>
        </div>
      </div>
    </div>
    </div>
  );
}