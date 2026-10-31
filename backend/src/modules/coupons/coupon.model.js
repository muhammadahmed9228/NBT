import mongoose, { Schema } from "mongoose";

const couponSchema = new Schema(
    {
        code: { type: String, required: true, unique: true, uppercase: true, trim: true, minlength: 3, maxlength: 32 },
        discountType: { type: String, enum: ["percentage", "fixed"], required: true },
        discountValue: { type: Number, required: true, min: 0 },
        minimumOrderAmount: { type: Number, default: 0, min: 0 },
        expiryDate: { type: Date, required: true },
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

couponSchema.path("discountValue").validate(function (value) {
    return this.discountType !== "percentage" || value <= 100;
}, "Percentage discount cannot exceed 100");

couponSchema.index({ code: 1, isActive: 1 });

export const Coupon = mongoose.model("Coupon", couponSchema);
