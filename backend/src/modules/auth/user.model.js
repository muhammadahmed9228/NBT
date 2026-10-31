import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            // NEW: Password is only required if the user is NOT using Google Auth
            required: [
                function () {
                    return !this.googleId;
                },
                "Password is required"
            ],
            minlength: [6, "Password must be at least 6 characters long"],
            maxlength: [8, "Password must be at most 8 characters long"],
        },
        // NEW: Google Auth Fields
        googleId: {
            type: String,
            default: null,
        },
        avatar: {
            type: String,
            default: null,
        },
        phone: {
            type: String,
            trim: true,
        },
        role: {
            type: String,
            enum: ["customer", "admin"],
            default: "customer",
        },
        refreshToken: {
            type: String,
        },
        forgotPasswordToken: String,
        forgotPasswordExpiry: Date,
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function () {
    // UPDATED: If password is not modified or doesn't exist (Google auth), skip hashing
    if (!this.isModified("password") || !this.password) return ;
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
    if (!this.password || !password) return false;
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            role: this.role,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

userSchema.methods.createPasswordResetToken = function () {
    // Generate a random token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash the token to save in the database for security
    this.forgotPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    // Set expiry time to 15 minutes
    this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000;

    return resetToken; // Return unhashed token to send via email
};

export const User = mongoose.model("User", userSchema);