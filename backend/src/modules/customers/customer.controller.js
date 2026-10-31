import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { User } from "../auth/user.model.js"; 

export const getAllCustomers = asyncHandler(async (req, res) => {
    // Fetch only users with the 'customer' role
    const customers = await User.find({ role: "customer" })
        .select("-password -refreshToken -forgotPasswordToken -forgotPasswordExpiry")
        .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, customers, "Customers fetched successfully"));
});