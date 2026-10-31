import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { Order } from "./order.model.js";
import { Product } from "../products/product.model.js";
import {
    sendOrderConfirmationEmail,
    sendAdminNewOrderNotification,
    sendOrderStatusEmail
} from "../../services/email.service.js";
import axios from "axios";
import { validateCoupon } from "../coupons/coupon.service.js";

export const createOrder = asyncHandler(async (req, res) => {
    const { customerInfo, shippingInfo, items, turnstileToken, couponCode, paymentMethod } = req.body;

    if (!turnstileToken) {
        return res.status(400).json({ message: "Security token is missing." });
    }

    try {
        const turnstileRes = await axios.post("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
            secret: process.env.TURNSTILE_SECRET_KEY,
            response: turnstileToken
        });

        if (!turnstileRes.data.success) {
            return res.status(400).json({ message: "Security verification failed." });
        }
    } catch (error) {
        return res.status(400).json({ message: "Security verification failed." });
    }

    if (!items || items.length === 0) {
        throw new ApiError(400, "Order items cannot be empty");
    }

    let calculatedSubtotal = 0;
    const orderItemsSnapshot = [];

    // 1. Authoritative Backend Price Calculation & Stock Verification
    for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) throw new ApiError(404, `Product ${item.name} not found`);

        const variant = product.variants.find(v => v.colorName === item.color);
        if (!variant) throw new ApiError(400, `Color ${item.color} invalid for ${product.name}`);

        let currentBasePrice = product.basePrice;

        // NEW: Check if CUSTOM size
        if (item.size === "CUSTOM") {
            if (!product.customSizing?.enabled) {
                throw new ApiError(400, `Custom sizing is not enabled for ${product.name}`);
            }
            // Add surcharge (Fulfils Enhancement 2: standard sizes have no extra price, only custom)
            currentBasePrice += (product.customSizing.surcharge || 0);
        } else {
            // Standard Size Logic
            const sizeObj = variant.sizes.find(s => s.sku === item.sku);
            if (!sizeObj) throw new ApiError(400, `SKU ${item.sku} invalid`);
            if (sizeObj.stock < item.quantity) {
                throw new ApiError(400, `Insufficient stock for ${product.name} (${item.size}). Available: ${sizeObj.stock}`);
            }
        }

        // Calculate authoritative price
        const finalUnitPrice = product.discount
            ? currentBasePrice - (currentBasePrice * (product.discount / 100))
            : currentBasePrice;

        calculatedSubtotal += finalUnitPrice * item.quantity;

        orderItemsSnapshot.push({
            productId: product._id,
            name: product.name,
            sku: item.sku,
            color: variant.colorName,
            size: item.size,
            quantity: item.quantity,
            unitPrice: finalUnitPrice,
            image: item.image,
            customMeasurements: item.customMeasurements || null // NEW: Save to DB
        });
    }

    let discountAmount = 0;
    let appliedCoupon = null;

    if (couponCode) {
        try {
            // NEW: Enforce one-time use of coupon per email address
            const previousOrder = await Order.findOne({
                "customerInfo.email": { $regex: new RegExp(`^${customerInfo.email}$`, "i") },
                "coupon.code": couponCode.toUpperCase(),
                status: { $ne: "Cancelled" }
            });

            if (previousOrder) {
                throw new ApiError(400, "You have already used this coupon code.");
            }

            const result = await validateCoupon(couponCode, calculatedSubtotal);
            discountAmount = result.discountAmount;
            appliedCoupon = {
                code: result.coupon.code,
                discountType: result.coupon.discountType,
                discountValue: result.coupon.discountValue,
                discountAmount: result.discountAmount
            };
        } catch (error) {
            throw new ApiError(400, `Coupon Error: ${error.message}`);
        }
    }

    const shippingCost = 250;
    
    // NEW: Apply Rs 100 bank transfer discount
    if (paymentMethod === "BANK_TRANSFER") {
        discountAmount += 100;
    }

    const total = calculatedSubtotal - discountAmount + shippingCost;

    // 2. Stock Deduction
    for (const item of orderItemsSnapshot) {
        if (item.size === "CUSTOM") {
            // Custom sizes are made-to-order, so we only increment the global sales counter
            await Product.updateOne(
                { _id: item.productId },
                { $inc: { "soldCount": item.quantity } }
            );
        } else {
            // Standard size deduction
            await Product.updateOne(
                { _id: item.productId },
                {
                    $inc:
                    {
                        "variants.$[v].sizes.$[s].stock": -item.quantity,
                        "soldCount": item.quantity
                    }
                },
                { arrayFilters: [{ "v.colorName": item.color }, { "s.sku": item.sku }] }
            );
        }
    }

    // 3. Order Creation
    const orderNumber = `Q-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    const order = await Order.create({
        orderNumber,
        userRef: req.user?._id || null, // Associates with account if logged in via optionalAuth
        customerInfo,
        shippingInfo: {
            address: shippingInfo?.address,
            city: shippingInfo?.city,
            postalCode: shippingInfo?.postalCode || "",
            notes: shippingInfo?.notes || ""
        },
        items: orderItemsSnapshot,
        pricing: {
            subtotal: calculatedSubtotal,
            discount: discountAmount,
            shippingCost,
            total
        },
        coupon: appliedCoupon,
        paymentMethod: paymentMethod || "COD"
    });

    //PHASE 12: Fire off emails asynchronously and in parallel
    try {
        await Promise.allSettled([
            sendOrderConfirmationEmail(order),
            sendAdminNewOrderNotification(order)
        ]);
    } catch (error) {
        console.error("Email dispatch failed during order creation:", error);
    }

    return res.status(201).json(new ApiResponse(201, order, "Order placed successfully"));
});

export const getMyOrders = asyncHandler(async (req, res) => {
    // req.user is guaranteed by verifyJWT
    const orders = await Order.find({ userRef: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

export const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) throw new ApiError(404, "Order not found");

    // Security: Customers can only view their own orders; Admins can view any.
    if (req.user.role !== "admin" && order.userRef?.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized access to this order");
    }

    return res.status(200).json(new ApiResponse(200, order, "Order fetched successfully"));
});

export const getAllOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sort = "newest", status, search, dateRange, dateFrom, dateTo } = req.query;

    // Base query
    const baseQuery = req.user.role === "admin" ? {} : { customer: req.user._id };

    // Search by Order ID, Name, or Phone
    if (search) {
        baseQuery.$or = [
            { orderNumber: { $regex: search, $options: "i" } },
            { "customerInfo.name": { $regex: search, $options: "i" } },
            { "customerInfo.phone": { $regex: search, $options: "i" } }
        ];
    }

    const now = new Date();
    let rangeStart;
    let rangeEnd;

    if (dateRange === "today") {
        rangeStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        rangeEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    } else if (dateRange === "this_week") {
        const day = now.getDay();
        rangeStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
        rangeEnd = new Date(rangeStart);
        rangeEnd.setDate(rangeStart.getDate() + 7);
    } else if (dateRange === "this_month") {
        rangeStart = new Date(now.getFullYear(), now.getMonth(), 1);
        rangeEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    } else if (dateRange === "this_year") {
        rangeStart = new Date(now.getFullYear(), 0, 1);
        rangeEnd = new Date(now.getFullYear() + 1, 0, 1);
    } else if (dateRange === "custom") {
        rangeStart = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null;
        rangeEnd = dateTo ? new Date(`${dateTo}T00:00:00`) : null;
        if (rangeEnd) rangeEnd.setDate(rangeEnd.getDate() + 1);

        if ((rangeStart && Number.isNaN(rangeStart.getTime())) || (rangeEnd && Number.isNaN(rangeEnd.getTime()))) {
            throw new ApiError(400, "Invalid custom date range provided");
        }
        if (rangeStart && rangeEnd && rangeStart >= rangeEnd) {
            throw new ApiError(400, "Custom start date must be before the end date");
        }
    }

    if (rangeStart || rangeEnd) {
        baseQuery.createdAt = {};
        if (rangeStart) baseQuery.createdAt.$gte = rangeStart;
        if (rangeEnd) baseQuery.createdAt.$lt = rangeEnd;
    }

    // NEW: Calculate counts for each status using Aggregation
    const statusCountsAgg = await Order.aggregate([
        { $match: baseQuery },
        { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const statusCounts = { Total: 0, Pending: 0, Confirmed: 0, Processing: 0, Shipped: 0, Delivered: 0, Cancelled: 0 };
    statusCountsAgg.forEach(item => {
        if (item._id && statusCounts[item._id] !== undefined) {
            statusCounts[item._id] = item.count;
        }
        statusCounts.Total += item.count;
    });

    // Apply the user's status filter for the actual list
    const query = { ...baseQuery };
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    let sortOptions = { createdAt: -1 };
    if (sort === "oldest") sortOptions = { createdAt: 1 };
    if (sort === "amount_high") sortOptions = { "pricing.total": -1 };
    if (sort === "amount_low") sortOptions = { "pricing.total": 1 };

    const orders = await Order.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit));

    const total = await Order.countDocuments(query);

    return res.status(200).json(new ApiResponse(200, {
        orders,
        total,
        statusCounts, // <-- Sending the calculated counts to the frontend
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
    }, "Orders fetched successfully"));
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const validStatuses = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];

    if (!validStatuses.includes(status)) {
        throw new ApiError(400, "Invalid status provided");
    }

    const order = await Order.findById(req.params.id);

    if (!order) throw new ApiError(404, "Order not found");

    if (["Delivered", "Cancelled"].includes(order.status) && order.status !== status) {
        throw new ApiError(400, `Cannot change a ${order.status.toLowerCase()} order status`);
    }

    order.status = status;
    await order.save();


    //PHASE 12: Trigger status email
    try {
        await sendOrderStatusEmail(order);
    } catch (error) {
        console.error("Status email dispatch failed:", error);
    }
    return res.status(200).json(new ApiResponse(200, order, "Order status updated successfully"));
});

export const deleteOrder = asyncHandler(async (req, res) => {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) throw new ApiError(404, "Order not found");

    return res.status(200).json(new ApiResponse(200, {}, "Order deleted successfully"));
});