const COUPON_CODE_KEY = "nbt-applied-coupon-code";

export const getStoredCouponCode = () => {
  try {
    return sessionStorage.getItem(COUPON_CODE_KEY) || "";
  } catch {
    return "";
  }
};

export const storeCouponCode = (code) => {
  try {
    if (code) sessionStorage.setItem(COUPON_CODE_KEY, String(code).toUpperCase());
    else sessionStorage.removeItem(COUPON_CODE_KEY);
  } catch {
    // Ignore storage failures in private browsing.
  }
};
