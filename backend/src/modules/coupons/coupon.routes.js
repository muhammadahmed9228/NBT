import { Router } from "express";
import { applyCoupon, createCoupon, deleteCoupon, getCoupons, toggleCouponStatus, updateCoupon } from "./coupon.controller.js";
import { verifyJWT, authorizeAdmin } from "../../middleware/auth.middleware.js";
import { couponApplyLimiter } from "../../middleware/rateLimiter.middleware.js";

const router = Router();

router.post("/apply", couponApplyLimiter, applyCoupon);
router.use(verifyJWT, authorizeAdmin);
router.get("/", getCoupons);
router.post("/", createCoupon);
router.patch("/:id/toggle-status", toggleCouponStatus);
router.patch("/:id", updateCoupon);
router.delete("/:id", deleteCoupon);

export default router;
