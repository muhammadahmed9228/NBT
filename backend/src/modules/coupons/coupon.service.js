import { Coupon } from "./coupon.model.js";
import { ApiError } from "../../utils/ApiError.js";

export const COUPON_CODE_PATTERN = /^[A-Z0-9_-]{3,32}$/;

export const normalizeCouponCode = (code) => String(code || "").trim().toUpperCase();

export const roundMoney = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

export const toEndOfDay = (dateInput) => {
    if (typeof dateInput === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateInput.trim())) {
        const [year, month, day] = dateInput.trim().split("-").map(Number);
        return new Date(year, month - 1, day, 23, 59, 59, 999);
    }
    const date = dateInput instanceof Date ? new Date(dateInput) : new Date(dateInput);
    if (Number.isNaN(date.getTime())) return date;
    date.setHours(23, 59, 59, 999);
    return date;
};

export const assertValidCouponPayload = ({
    code,
    discountType,
    discountValue,
    minimumOrderAmount = 0,
    expiryDate,
    allowPastExpiry = false
}) => {
    const normalizedCode = normalizeCouponCode(code);
    if (!COUPON_CODE_PATTERN.test(normalizedCode)) {
        throw new ApiError(400, "Coupon code must be 3-32 letters, numbers, underscores, or hyphens");
    }
    if (!["percentage", "fixed"].includes(discountType)) {
        throw new ApiError(400, "Invalid discount type");
    }

    const value = Number(discountValue);
    const minimum = Number(minimumOrderAmount);
    const expiry = (allowPastExpiry && expiryDate instanceof Date)
        ? new Date(expiryDate)
        : toEndOfDay(expiryDate);

    if (!Number.isFinite(value) || value <= 0 || (discountType === "percentage" && value > 100)) {
        throw new ApiError(400, "Invalid discount value");
    }
    if (!Number.isFinite(minimum) || minimum < 0) {
        throw new ApiError(400, "Invalid minimum order amount");
    }
    if (Number.isNaN(expiry.getTime())) {
        throw new ApiError(400, "Invalid expiry date");
    }
    if (!allowPastExpiry && expiry.getTime() < Date.now()) {
        throw new ApiError(400, "Expiry date must be in the future");
    }

    return {
        code: normalizedCode,
        discountType,
        discountValue: value,
        minimumOrderAmount: minimum,
        expiryDate: expiry
    };
};

export const validateCoupon = async (code, subtotal) => {
    const normalizedCode = normalizeCouponCode(code);
    if (!COUPON_CODE_PATTERN.test(normalizedCode)) {
        throw new ApiError(400, "Invalid coupon code");
    }

    const amount = Number(subtotal);
    if (!Number.isFinite(amount) || amount < 0) {
        throw new ApiError(400, "A valid subtotal is required");
    }

    const coupon = await Coupon.findOne({ code: normalizedCode, isActive: true });
    if (!coupon) {
        throw new ApiError(400, "Invalid or inactive coupon code");
    }
    if (coupon.expiryDate <= new Date()) {
        throw new ApiError(400, "This coupon has expired");
    }
    if (amount < coupon.minimumOrderAmount) {
        throw new ApiError(400, `Minimum order amount is Rs. ${coupon.minimumOrderAmount.toLocaleString()}`);
    }

    const rawDiscount = coupon.discountType === "percentage"
        ? amount * (coupon.discountValue / 100)
        : coupon.discountValue;

    return {
        coupon,
        discountAmount: roundMoney(Math.min(amount, Math.max(0, rawDiscount)))
    };
};
