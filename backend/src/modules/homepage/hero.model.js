import mongoose, { Schema } from "mongoose";

const heroSlideSchema = new Schema(
    {
        image: {
            url: { type: String, required: true },
            fileId: { type: String, required: true },
        },
        heading: {
            type: String,
            required: [true, "Heading is required"],
            trim: true,
        },
        subtitle: {
            type: String,
            trim: true,
        },
        buttonText: {
            type: String,
            default: "Shop Now",
            trim: true,
        },
        buttonUrl: {
            type: String,
            default: "/products",
            trim: true,
        },
        enabled: {
            type: Boolean,
            default: true,
        },
        displayOrder: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Indexing for efficient queries on the public homepage
heroSlideSchema.index({ enabled: 1, displayOrder: 1 });

export const HeroSlide = mongoose.model("HeroSlide", heroSlideSchema);