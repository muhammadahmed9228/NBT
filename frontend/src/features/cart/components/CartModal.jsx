import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { closeCart, removeFromCart, updateQuantity } from "../cartSlice";
import { calculateItemPrice } from "../cartPricing";

export default function CartModal() {
  const { items, isCartOpen } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const subtotal = items.reduce(
    (total, item) =>
      total +
      (item.price ?? item.unitPrice ?? calculateItemPrice(item)) *
        item.quantity,
    0,
  );

  const handleCheckout = () => {
    dispatch(closeCart());
    navigate("/checkout");
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[140] overflow-hidden">
      {/* Dark Backdrop */}
      <div
        className="absolute inset-0 bg-nbt-espresso/60 transition-opacity"
        onClick={() => dispatch(closeCart())}
      />

      {/* Slide-over Panel */}
      <div className="nbt-cart-drawer absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-nbt-champagne bg-nbt-cream shadow-xl animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-nbt-champagne px-6 py-4">
          <h2 className="text-2xl font-medium text-nbt-espresso">
            Your Cart ({items.length})
          </h2>
          <button
            onClick={() => dispatch(closeCart())}
            className="text-neutral-500 transition hover:text-nbt-bronze"
          >
            ✕
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {items.length === 0 ? (
            <div className="text-center text-neutral-500 py-10">
              <p>Your cart is empty.</p>
              <button
                onClick={() => dispatch(closeCart())}
                className="mt-2 text-nbt-bronze underline"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.cartItemId} className="nbt-drawer-item flex gap-4 border-b border-nbt-champagne pb-4">
                <Link to={`/products/${item.productId}`} onClick={() => dispatch(closeCart())}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-24 w-20 object-cover border border-nbt-champagne"
                  />
                </Link>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <Link to={`/products/${item.productId}`} onClick={() => dispatch(closeCart())}>
                      <h3 className="font-medium leading-tight text-nbt-espresso hover:text-nbt-bronze">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-neutral-500 mt-1">
                      {item.color} | Size: {item.size}
                    </p>

                    {/* NEW: Render Custom Measurements if they exist */}
                    {item.size === "CUSTOM" && item.customMeasurements && (
                      <div className="mt-1.5 flex flex-wrap gap-x-2 border border-nbt-champagne bg-nbt-champagne/20 p-1.5 text-[10px] leading-tight text-nbt-espresso">
                        {Object.entries(item.customMeasurements).map(
                          ([key, val]) => (
                            <span key={key} className="font-medium">
                              {key}: {val}"
                            </span>
                          ),
                        )}
                      </div>
                    )}

                    <p className="mt-1 text-sm font-semibold text-nbt-bronze">
                      Rs.{" "}
                      {(
                        item.price ??
                        item.unitPrice ??
                        calculateItemPrice(item)
                      ).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-nbt-champagne">
                      <button
                        onClick={() =>
                          dispatch(
                            updateQuantity({
                              cartItemId: item.cartItemId,
                              quantity: Math.max(1, item.quantity - 1),
                            }),
                          )
                        }
                        className="px-2 py-1 text-neutral-600 transition hover:bg-nbt-cream"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-sm">{item.quantity}</span>
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
                        className="px-2 py-1 text-neutral-600 transition hover:bg-nbt-cream"
                      >
                        +
                      </button>
                    </div>
                    {item.stock > 0 && item.quantity >= item.stock && (
                      <span className="text-xs text-nbt-bronze">
                        Maximum available: {item.stock}
                      </span>
                    )}
                    <button
                      onClick={() => dispatch(removeFromCart(item.cartItemId))}
                      className="text-xs text-nbt-bronze hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Checkout */}
        {items.length > 0 && (
          <div className="border-t border-nbt-champagne bg-nbt-champagne/20 p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium text-neutral-600">Subtotal</span>
              <span className="text-xl font-bold text-nbt-bronze">
                Rs. {subtotal.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mb-4">
              Shipping and taxes calculated at checkout.
            </p>
            <button
              onClick={handleCheckout}
              className="w-full bg-nbt-espresso py-3 font-bold text-white transition hover:bg-nbt-bronze"
            >
              Proceed to Checkout
            </button>
            <button
              onClick={() => {
                dispatch(closeCart());
                navigate("/cart");
              }}
              className="mt-4 w-full text-center text-sm text-neutral-600 hover:text-nbt-bronze hover:underline"
            >
              View Full Cart Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
