import mongoose from "mongoose";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { Coupon } from "./coupon.model.js";
import {
    assertValidCouponPayload,
    validateCoupon
} from "./coupon.service.js";

const requireValidId = (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid coupon id");
    }
};

export const getCoupons = asyncHandler(async (req, res) => {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, coupons, "Coupons fetched successfully"));
});

export const createCoupon = asyncHandler(async (req, res) => {
    const payload = assertValidCouponPayload(req.body);
    const existing = await Coupon.findOne({ code: payload.code });
    if (existing) throw new ApiError(409, "Coupon code already exists");

    const coupon = await Coupon.create({
        ...payload,
        isActive: req.body.isActive !== undefined ? Boolean(req.body.isActive) : true
    });

    return res.status(201).json(new ApiResponse(201, coupon, "Coupon created successfully"));
});

export const updateCoupon = asyncHandler(async (req, res) => {
    requireValidId(req.params.id);

    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) throw new ApiError(404, "Coupon not found");

    const nextValues = {
        code: req.body.code !== undefined ? req.body.code : coupon.code,
        discountType: req.body.discountType !== undefined ? req.body.discountType : coupon.discountType,
        discountValue: req.body.discountValue !== undefined ? req.body.discountValue : coupon.discountValue,
        minimumOrderAmount: req.body.minimumOrderAmount !== undefined ? req.body.minimumOrderAmount : coupon.minimumOrderAmount,
        expiryDate: req.body.expiryDate !== undefined ? req.body.expiryDate : coupon.expiryDate
    };

    const payload = assertValidCouponPayload({
        ...nextValues,
        allowPastExpiry: req.body.expiryDate === undefined
    });

    if (payload.code !== coupon.code) {
        const existing = await Coupon.findOne({ code: payload.code, _id: { $ne: coupon._id } });
        if (existing) throw new ApiError(409, "Coupon code already exists");
    }

    coupon.set({
        ...payload,
        ...(req.body.isActive !== undefined ? { isActive: Boolean(req.body.isActive) } : {})
    });
    await coupon.save();

    return res.status(200).json(new ApiResponse(200, coupon, "Coupon updated successfully"));
});

export const toggleCouponStatus = asyncHandler(async (req, res) => {
    requireValidId(req.params.id);
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) throw new ApiError(404, "Coupon not found");

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    return res.status(200).json(new ApiResponse(200, coupon, `Coupon ${coupon.isActive ? "activated" : "deactivated"} successfully`));
});

export const deleteCoupon = asyncHandler(async (req, res) => {
    requireValidId(req.params.id);
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) throw new ApiError(404, "Coupon not found");
    return res.status(200).json(new ApiResponse(200, {}, "Coupon deleted successfully"));
});

export const applyCoupon = asyncHandler(async (req, res) => {
    const { coupon, discountAmount } = await validateCoupon(req.body.code, req.body.subtotal);
    return res.status(200).json(new ApiResponse(200, {
        code: coupon.code,
        discountAmount,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
    }, "Coupon applied successfully"));
});
