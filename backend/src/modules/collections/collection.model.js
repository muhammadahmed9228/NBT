import mongoose, { Schema } from "mongoose";

const collectionSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Collection name is required"],
            trim: true,
            unique: true
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        image: {
            url: { type: String },
            fileId: { type: String }
        },
        enabled: {
            type: Boolean,
            default: true
        },
        displayOrder: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

export const Collection = mongoose.model("Collection", collectionSchema);