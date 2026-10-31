import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize"; 
import { globalLimiter } from "./middleware/rateLimiter.middleware.js"; 
import { errorHandler } from "./middleware/error.middleware.js";
import { ApiResponse } from "./utils/ApiResponse.js";

const app = express();

// Render/Cloudflare/AWS runs the service behind a reverse proxy.
// Set TRUST_PROXY_HOPS in your environment if there are multiple proxies (e.g. Cloudflare -> Render = 2)
app.set("trust proxy", process.env.TRUST_PROXY_HOPS ? parseInt(process.env.TRUST_PROXY_HOPS, 10) : 1);

// Public process health check for Render and uptime monitors.
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

// Middleware
app.use(helmet());
// Parse environment origins and trim any accidental whitespaces
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()) 
  : [];

app.use(cors({
    origin: function (origin, callback) {
        // 1. Allow non-browser requests (like Postman) ONLY in development environment
        const isDevelopment = process.env.NODE_ENV === 'development';
        
        // 2. Check if the incoming origin is authorized
        if (!origin && isDevelopment) {
            callback(null, true);
        } else if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// FIX: Make req.query writable for Express 5 so mongo-sanitize doesn't crash
app.use((req, res, next) => {
    Object.defineProperty(req, 'query', {
        value: { ...req.query },
        writable: true,
        configurable: true,
        enumerable: true,
    });
    next();
});

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());
// Apply global rate limiting to all /api routes
app.use("/api", globalLimiter);

// Base API Route
const API_PREFIX = "/api/v1";

// Health Check Endpoint
app.get(`${API_PREFIX}/health`, (req, res) => {
    res.status(200).json(new ApiResponse(200, null, "Server is running perfectly"));
});

// Route Imports
import authRouter from "./modules/auth/auth.routes.js";
import collectionRouter from "./modules/collections/collection.routes.js";
import productRouter from "./modules/products/product.routes.js";
import uploadRouter from "./modules/uploads/upload.routes.js";
import orderRouter from "./modules/orders/order.routes.js";
import adminRouter from "./modules/admin/admin.routes.js";
import customerRouter from "./modules/customers/customer.routes.js";
import homeRouter from "./modules/homepage/hero.routes.js";
import sectionRouter from "./modules/homepage/section.routes.js";
import announcementRouter from "./modules/announcements/announcement.routes.js";
import couponRouter from "./modules/coupons/coupon.routes.js";

// Routes Declaration
app.use(`${API_PREFIX}/auth`, authRouter);
app.use(`${API_PREFIX}/collections`, collectionRouter);
app.use(`${API_PREFIX}/products`, productRouter);
app.use(`${API_PREFIX}/uploads`, uploadRouter);
app.use(`${API_PREFIX}/orders`, orderRouter);
app.use(`${API_PREFIX}/admin`, adminRouter);
app.use(`${API_PREFIX}/customers`, customerRouter);
app.use(`${API_PREFIX}/home`, homeRouter);
app.use(`${API_PREFIX}/home-sections`, sectionRouter);
app.use(`${API_PREFIX}/announcements`, announcementRouter);
app.use(`${API_PREFIX}/coupons`, couponRouter);

// Global Error Handler
app.use(errorHandler);

export { app };