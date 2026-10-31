import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { applyCouponApi } from "../api/checkoutApi";
import { getStoredCouponCode, storeCouponCode } from "../couponStorage";

export default function useAppliedCoupon(subtotal) {
  const [coupon, setCoupon] = useState(null);

  useEffect(() => {
    const code = getStoredCouponCode();
    if (!code || !Number.isFinite(subtotal) || subtotal <= 0) {
      return undefined;
    }

    let active = true;
    applyCouponApi({ code, subtotal })
      .then((response) => {
        if (active) setCoupon(response.data);
      })
      .catch((error) => {
        storeCouponCode("");
        if (active) {
          setCoupon(null);
          toast.error(error.message || "Coupon is no longer valid");
        }
      });

    return () => {
      active = false;
    };
  }, [subtotal]);

  const apply = (data) => {
    setCoupon(data);
    storeCouponCode(data?.code || "");
  };

  const clear = () => {
    setCoupon(null);
    storeCouponCode("");
  };

  return { coupon, apply, clear };
}
