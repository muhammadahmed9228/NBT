import { useState } from "react";
import { toast } from "react-toastify";
import { applyCouponApi } from "../api/checkoutApi";

export default function CouponBox({ subtotal, coupon, onApply, onClear }) {
  const [inputCode, setInputCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleApply = async (event) => {
    event.preventDefault();
    const code = inputCode.trim().toUpperCase();
    if (!code) {
      toast.error("Please enter a coupon code");
      return;
    }
    if (!/^[A-Z0-9_-]{3,32}$/.test(code)) {
      toast.error("Please enter a valid coupon code");
      return;
    }

    setLoading(true);
    try {
      const response = await applyCouponApi({ code, subtotal });
      onApply(response.data);
      setInputCode("");
      toast.success(`Coupon ${response.data.code} applied!`);
    } catch (error) {
      toast.error(error.message || "Unable to apply coupon");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    onClear();
    toast.info("Coupon removed");
  };

  return (
    <div className="border-y border-qala-champagne py-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-qala-espresso">
        Have a coupon?
      </p>

      {coupon ? (
        <div className="flex items-center justify-between rounded border border-qala-bronze/40 bg-qala-cream/50 px-3 py-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold tracking-wider text-qala-espresso">
                {coupon.code}
              </span>
              <span className="rounded bg-qala-bronze/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-qala-bronze">
                Applied
              </span>
            </div>
            {coupon.discountAmount > 0 && (
              <p className="mt-0.5 text-xs text-qala-bronze">
                Saving Rs. {coupon.discountAmount.toLocaleString()}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-700 transition hover:border-red-400 hover:text-red-700"
          >
            Remove
          </button>
        </div>
      ) : (
        <form onSubmit={handleApply} className="flex gap-2">
          <input
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
            placeholder="ENTER CODE"
            maxLength={32}
            disabled={loading}
            autoComplete="off"
            className="min-w-0 flex-1 border border-qala-champagne bg-white px-3 py-2 text-sm uppercase focus:border-qala-bronze focus:outline-none disabled:bg-neutral-100"
          />
          <button
            type="submit"
            disabled={loading || !inputCode.trim()}
            className="bg-qala-espresso px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-qala-bronze disabled:opacity-50"
          >
            {loading ? "..." : "Apply"}
          </button>
        </form>
      )}
    </div>
  );
}
