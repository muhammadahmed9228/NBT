import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    changeCurrentPassword,
    updateAccountDetails,
    forgotPassword,
    resetPassword,
    googleLogin
} from "./auth.controller.js";
import { verifyJWT } from "../../middleware/auth.middleware.js";
import { authLimiter } from "../../middleware/rateLimiter.middleware.js";

const router = Router();

// Public routes with STRICT rate limiting
router.route("/register").post(authLimiter, registerUser);
router.route("/login").post(authLimiter, loginUser);
router.route("/forgot-password").post(authLimiter, forgotPassword);
router.route("/reset-password/:resetToken").post(authLimiter, resetPassword);
// Google Auth Route
router.post("/google", googleLogin);

// Secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/me").get(verifyJWT, getCurrentUser);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/update-profile").patch(verifyJWT, updateAccountDetails);

export default router;