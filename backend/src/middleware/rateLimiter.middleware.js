import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { ipKeyGenerator } from "express-rate-limit";

const GLOBAL_LIMIT = 400;
const ADMIN_LIMIT = 15000; //was 2000
const WINDOW_MS = 15 * 60 * 1000;

const getAdminToken = (req) => {
    // Cache the result on the request object since this function is called multiple times per request
    if (req.adminToken !== undefined) return req.adminToken;

    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token || !process.env.ACCESS_TOKEN_SECRET) {
        req.adminToken = null;
        return null;
    }

    // Lightweight payload parsing to prevent CPU exhaustion (jwt.verify is expensive)
    const decoded = jwt.decode(token);
    
    // If the token isn't claiming to be an admin, skip expensive signature verification
    if (!decoded || decoded.role !== "admin" || !decoded._id) {
        req.adminToken = null;
        return null;
    }

    // It claims to be an admin, so we must verify the signature to prevent forged token exploits
    try {
        const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const adminToken = verified.role === "admin" && verified._id ? verified : null;
        req.adminToken = adminToken;
        return adminToken;
    } catch {
        req.adminToken = null;
        return null;
    }
};

// Public/customer traffic stays at 100 requests per 15 minutes per IP.
// A signed admin token receives a higher account-based limit for dashboard work.
export const globalLimiter = rateLimit({
    windowMs: WINDOW_MS,
    limit: (req) => getAdminToken(req) ? ADMIN_LIMIT : GLOBAL_LIMIT,
    keyGenerator: (req) => {
        const adminToken = getAdminToken(req);
        return adminToken ? `admin:${adminToken._id}` : ipKeyGenerator(req.ip);
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
        const message = getAdminToken(req)
            ? "Too many admin requests, please try again after 15 minutes"
            : "Too many requests from this IP, please try again after 15 minutes";
        next(new ApiError(429, message));
    },
});

// Strict Auth Limiter: 6 failed attempts per 15 minutes per IP
export const authLimiter = rateLimit({
    windowMs: WINDOW_MS,
    max: 6,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
        next(new ApiError(429, "Too many authentication attempts, please try again later"));
    },
});

// Strict Coupon Apply Limiter: 10 attempts per 15 minutes per IP
export const couponApplyLimiter = rateLimit({
    windowMs: WINDOW_MS,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
        next(new ApiError(429, "Too many coupon attempts, please try again later"));
    },
});