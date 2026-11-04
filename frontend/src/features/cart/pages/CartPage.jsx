import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { updateQuantity, removeFromCart, applyCoupon, removeCoupon } from "../cartSlice";
import { calculateItemPrice } from "../cartPricing";
import { useState } from "react";
// import { toast } from "react-toastify";
// import { validateCouponApi } from "../../checkout/api/checkoutApi";

export default function CartPage() {
  const { items, coupon } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // const [couponInput, setCouponInput] = useState("");
  // const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const subtotal = items.reduce(
    (total, item) =>
      total +
      (item.price ?? item.unitPrice ?? calculateItemPrice(item)) *
      item.quantity,
    0,
  );

  let discount = 0;
  if (coupon) {
    if (coupon.discountType === "percentage") {
      discount = (subtotal * coupon.discountValue) / 100;
    } else {
      discount = coupon.discountValue;
    }
  }
  const estimatedTotal = Math.max(0, subtotal - discount);

  // const handleApplyCoupon = async (e) => {
  //   e.preventDefault();
  //   if (!couponInput.trim()) return;
  //   setIsValidatingCoupon(true);
  //   try {
  //     const res = await validateCouponApi(couponInput, subtotal);
  //     dispatch(applyCoupon(res.data.coupon));
  //     setCouponInput("");
  //     toast.success("Coupon applied successfully!");
  //   } catch (error) {
  //     toast.error(error.response?.data?.message || "Invalid coupon code");
  //   } finally {
  //     setIsValidatingCoupon(false);
  //   }
  // };

  if (items.length === 0) {
    return (
      <div className="nbt-empty-cart py-20 text-center">
        <h2 className="mb-4 text-3xl font-medium text-nbt-espresso">
          Your Cart is Empty
        </h2>
        <p className="mb-8 text-neutral-600">
          Looks like you haven't added anything yet.
        </p>
        <Link
          to="/products"
          className="bg-nbt-espresso px-6 py-3 text-white transition hover:bg-nbt-bronze"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="nbt-cart-page mx-auto max-w-5xl py-5 md:py-8">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-nbt-bronze">Your NBT edit</p>
      <h2 className="mb-8 text-4xl font-medium text-nbt-espresso">Shopping Cart</h2>

      <div className="nbt-cart-layout flex flex-col lg:flex-row gap-10">
        <div className="nbt-cart-items flex-1 space-y-6">
          {items.map((item) => (
            <div
              key={item.cartItemId}
              className="nbt-cart-item flex gap-4 border border-nbt-champagne bg-white p-3 md:p-4"
            >
              <Link to={`/products/${item.productId}`}>
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-32 w-24 object-cover hover:opacity-80 transition"
                />
              </Link>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <Link to={`/products/${item.productId}`}>
                      <h3 className="text-lg font-medium text-nbt-espresso hover:text-nbt-bronze">{item.name}</h3>
                    </Link>
                    <button
                      onClick={() => dispatch(removeFromCart(item.cartItemId))}
                      className="text-sm text-nbt-bronze hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <p className="text-sm text-neutral-600">
                    Color: {item.color} | Size: {item.size}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    SKU: {item.sku}
                  </p>

                  {/* NEW: Render Custom Measurements */}
                  {item.size === "CUSTOM" && item.customMeasurements && (
                    <div className="mt-2 inline-flex flex-wrap gap-2 border border-nbt-champagne bg-nbt-champagne/20 p-2 text-xs text-nbt-espresso">
                      <span className="font-bold">Custom Fit:</span>
                      {Object.entries(item.customMeasurements).map(
                        ([key, val]) => (
                          <span key={key}>
                            {key}: {val}"
                          </span>
                        ),
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center border border-nbt-champagne">
                    <button
                      onClick={() =>
                        dispatch(
                          updateQuantity({
                            cartItemId: item.cartItemId,
                            quantity: item.quantity - 1,
                          }),
                        )
                      }
                      className="px-3 py-1 transition hover:bg-nbt-cream"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="px-3 py-1 font-medium text-sm">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        dispatch(
                          updateQuantity({
                            cartItemId: item.cartItemId,
                            quantity: item.quantity + 1,
                          }),
                        )
                      }
                      disabled={item.stock > 0 && item.quantity >= item.stock}
                      className="px-3 py-1 transition hover:bg-nbt-cream"
                    >
                      +
                    </button>
                  </div>
                  {item.stock > 0 && item.quantity >= item.stock && (
                    <span className="text-xs text-nbt-bronze">
                      Maximum available: {item.stock}
                    </span>
                  )}
                  <span className="font-semibold">
                    Rs.{" "}
                    {(
                      calculateItemPrice(item) * item.quantity
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="nbt-cart-summary h-fit w-full space-y-4 border border-nbt-champagne bg-nbt-champagne/20 p-5 lg:w-80">
          <h3 className="border-b border-nbt-champagne pb-3 text-lg font-medium text-nbt-espresso">
            Order Summary
          </h3>
          <div className="flex justify-between text-neutral-600">
            <span>Subtotal ({items.length} items)</span>
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

          <div className="flex justify-between text-neutral-600">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="flex justify-between border-t border-nbt-champagne pt-3 text-lg font-bold text-nbt-espresso">
            <span>Estimated Total</span>
            <span>Rs. {estimatedTotal.toLocaleString()}</span>
          </div>

          {/* Coupon Input Form */}
          {/* <form onSubmit={handleApplyCoupon} className="mt-4 flex gap-2">
            <input
              type="text"
              placeholder="Coupon Code"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              className="w-full border border-nbt-champagne bg-white px-3 py-2 text-sm text-nbt-espresso outline-none focus:border-nbt-bronze"
            />
            <button
              type="submit"
              disabled={isValidatingCoupon || !couponInput.trim()}
              className="bg-nbt-espresso px-4 py-2 text-sm font-medium text-white transition hover:bg-nbt-bronze disabled:opacity-50"
            >
              {isValidatingCoupon ? "Applying..." : "Apply"}
            </button>
          </form> */}

          <button
            onClick={() => navigate("/checkout")}
            className="mt-4 w-full bg-nbt-espresso py-3 font-medium text-white transition hover:bg-nbt-bronze"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
