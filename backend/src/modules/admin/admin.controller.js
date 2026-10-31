import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { Order } from "../orders/order.model.js";
import { User } from "../auth/user.model.js";
import { Product } from "../products/product.model.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
    // 1. Get basic counts
    const totalCustomers = await User.countDocuments({ role: "customer" });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    // 2. Order Status Breakdown
    const pendingOrders = await Order.countDocuments({ status: "Pending" });
    const processingOrders = await Order.countDocuments({ status: "Processing" });
    const deliveredOrders = await Order.countDocuments({ status: "Delivered" });
    const cancelledOrders = await Order.countDocuments({ status: "Cancelled" });

    // 3. Calculate Total Revenue (only from delivered orders)
    const revenueAggregation = await Order.aggregate([
        { $match: { status: "Delivered" } },
        { $group: { _id: null, totalRevenue: { $sum: "$pricing.total" } } }
    ]);
    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

    // 4. Fetch Recent Orders
    const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("orderNumber customerInfo.name pricing.total status createdAt");

    const dashboardData = {
        stats: {
            revenue: totalRevenue,
            customers: totalCustomers,
            products: totalProducts,
            orders: {
                total: totalOrders,
                pending: pendingOrders,
                processing: processingOrders,
                delivered: deliveredOrders,
                cancelled: cancelledOrders
            }
        },
        recentOrders
    };

    return res.status(200).json(new ApiResponse(200, dashboardData, "Dashboard stats fetched successfully"));
});