import { OAuth2Client } from "google-auth-library";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { User } from "../auth/user.model.js";
import crypto from "crypto";
import axios from "axios";
import { sendPasswordResetEmail } from "../../services/email.service.js";

// Part 1
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
};

export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, phone, turnstileToken } = req.body;

    if (!turnstileToken) {
        return res.status(400).json({ message: "Security token is missing." });
    }

    try {
        // The user prompt said 'https://cloudflare.com', but the actual endpoint for Turnstile is this one.
        // Using the standard Turnstile endpoint to ensure it works correctly.
        const turnstileRes = await axios.post("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
            secret: process.env.TURNSTILE_SECRET_KEY,
            response: turnstileToken
        });

        if (!turnstileRes.data.success) {
            return res.status(400).json({ message: "Security verification failed. Automated request blocked." });
        }
    } catch (error) {
        return res.status(400).json({ message: "Security verification failed. Automated request blocked." });
    }

    if ([name, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "Name, email, and password are required");
    }

    if (password.length < 6 || password.length > 8) {
        throw new ApiError(400, "Password must be between 6 and 8 characters long");
    }

    const existedUser = await User.findOne({ email });
    if (existedUser) {
        throw new ApiError(409, "User with this email already exists");
    }

    const user = await User.create({
        name,
        email,
        password,
        phone,
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});

export const loginUser = asyncHandler(async (req, res) => {
    const { email, password, turnstileToken } = req.body;

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

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "User logged in successfully"
            )
        );
});

export const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { $unset: { refreshToken: 1 } },
        { new: true }
    );

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

// Part 2
export const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!newPassword) {
        throw new ApiError(400, "New password is required");
    }

    if (newPassword.length < 6 || newPassword.length > 8) {
        throw new ApiError(400, "New password must be between 6 and 8 characters long");
    }

    const user = await User.findById(req.user?._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // If user already has a password set, verify old password
    if (user.password) {
        if (!oldPassword) {
            throw new ApiError(400, "Current password is required");
        }
        const isPasswordValid = await user.isPasswordCorrect(oldPassword);
        if (!isPasswordValid) {
            throw new ApiError(400, "Invalid old password");
        }
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false }); // Pre-save hook will hash it

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password updated successfully"));
});

export const updateAccountDetails = asyncHandler(async (req, res) => {
    const { name, phone } = req.body;

    if (!name) {
        throw new ApiError(400, "Name is required");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                name,
                phone, // Optional
            },
        },
        { new: true, runValidators: true }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"));
});

export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email });

    // We do not throw an error if user is not found to prevent email enumeration attacks
    if (!user) {
        return res
            .status(200)
            .json(new ApiResponse(200, null, "If an account exists, a reset token will be issued."));
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // PHASE 12: Send Password Reset Email
    await sendPasswordResetEmail(user.email, resetToken);

    return res.status(200).json(
        new ApiResponse(200, null, "If an account exists, a password reset email has been sent.")
    );
});

export const resetPassword = asyncHandler(async (req, res) => {
    const { resetToken } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
        throw new ApiError(400, "New password is required");
    }

    if (newPassword.length < 6 || newPassword.length > 8) {
        throw new ApiError(400, "New password must be between 6 and 8 characters long");
    }

    // Hash the token from params to compare with the one in DB
    const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    const user = await User.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
        throw new ApiError(400, "Token is invalid or has expired");
    }

    user.password = newPassword;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password reset successfully"));
});


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = asyncHandler(async (req, res) => {
    const { token } = req.body;

    if (!token) {
        throw new ApiError(400, "Google token is required");
    }

    try {
        // 1. Verify the token securely with Google
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        // 2. Extract the user's details from the verified token
        const { email, name, picture, sub: googleId } = ticket.getPayload();

        // 3. Check if the user already exists in your database
        let user = await User.findOne({ email });

        if (!user) {
            // 4. If they don't exist, create a new account automatically
            user = await User.create({
                name,
                email,
                googleId,
                avatar: picture,
                // If you have email verification in your app, auto-verify them!
                isEmailVerified: true 
            });
        } else if (!user.googleId) {
            // If they signed up manually before, link their Google account now
            user.googleId = googleId;
            if (!user.avatar) user.avatar = picture;
            await user.save();
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        // Remove sensitive info before sending response
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json(
                new ApiResponse(
                    200,
                    { user: loggedInUser, accessToken, refreshToken },
                    "Google Login Successful"
                )
            );

    } catch (error) {
        console.error("Google Auth Error:", error);
        throw new ApiError(401, "Invalid Google token");
    }
});