import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js"; // Assuming your asyncHandler is here
import jwt from "jsonwebtoken";
import { User } from "../modules/auth/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, "Invalid Access Token");
    }
});

export const authorizeAdmin = asyncHandler(async (req, res, next) => {
    if (req.user.role !== "admin") {
        throw new ApiError(403, "Access denied. Admin authorization required.");
    }
    next();
});

export const optionalAuth = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    
    if (token) {
        try {
            const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findById(decodedToken?._id).select("-password");
            if (user) req.user = user;
        } catch (error) {
            // Silently fail for guests with expired/invalid tokens
        }
    }
    next();
});