import mongoose, { Schema } from "mongoose";

// Schema for ImageKit references
const imageSchema = new Schema({
    url: { type: String, required: true },
    fileId: { type: String, required: true },
    isPrimary: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 }
}, { _id: false });

// Sizes hold the actual purchasable stock and unique SKU
const sizeSchema = new Schema({
    size: { 
        type: String, 
        required: true, 
        trim: true // e.g., 'S', 'M', 'L', 'Unstitched'
    },
    sku: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true 
    },
    stock: { 
        type: Number, 
        required: true, 
        min: [0, "Stock cannot be negative"], 
        default: 0 
    }
    // REMOVED: priceVariation (Price now only varies for Custom Sizes)
});

// Define the limit function
const arrayLimit = (val) => {
  return val.length <= 5;
};

// Variants represent colors, which hold images and the available sizes
const variantSchema = new Schema({
    colorName: { 
        type: String, 
        required: true, 
        trim: true 
    },
    colorCode: { 
        type: String, 
        required: true, 
        trim: true 
    },
    images: {
        type: [{
            url: String,
            fileId: String
        }],
        validate: [arrayLimit, "A maximum of 5 images are allowed per color variation"]
    },
    sizes: [sizeSchema]
});

// The main product document
const productSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Product name is required"],
            trim: true,
        },
        slug: {
            type: String,
            required: [true, "Slug is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Description is required"],
        },
        basePrice: {
            type: Number,
            required: [true, "Base price is required"],
            min: [0, "Price cannot be negative"],
        },
        discount: {
            type: Number,
            default: 0,
            min: [0, "Discount cannot be less than 0%"],
            max: [100, "Discount cannot exceed 100%"],
        },
        collectionRef: {
            type: Schema.Types.ObjectId,
            ref: "Collection",
            default: null
        },
        featured: {
            type: Boolean,
            default: false,
        },
        isFeatured: {
            type: Boolean,
            default: false
        },
        soldCount: {
            type: Number,
            default: 0
        },
        published: {
            type: Boolean,
            default: false,
        },
        isDeleted: {
            type: Boolean,
            default: false,
            index: true,
        },
        thumbnail: {
            url: { type: String, required: true },
            fileId: { type: String, required: true },
        },
        
        // NEW: Size Chart Image Upload
        sizeChartImage: {
            url: { type: String },
            fileId: { type: String }
        },

        // NEW: Custom Sizing Configuration
        customSizing: {
            enabled: { type: Boolean, default: false },
            surcharge: { type: Number, default: 0 }, // Extra cost for custom size
            requiredMeasurements: [{ type: String }] // e.g., ["Chest", "Waist", "Length"]
        },

        variants: [variantSchema],
    },
    {
        timestamps: true,
    }
);

productSchema.index({ published: 1, featured: 1 });
productSchema.index({ collectionRef: 1 });

export const Product = mongoose.model("Product", productSchema);