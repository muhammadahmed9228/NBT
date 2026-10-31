import mongoose from "mongoose"; 
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { Product } from "./product.model.js";

const BRAND_SKU_ABBR = "Q";

// Helper: Cleans text and extracts 3 uppercase characters
const generateAbbreviation = (text, length = 3) => {
    if (!text) return "";
    return text.replace(/[^a-zA-Z0-9]/g, "").substring(0, length).toUpperCase();
};

// Helper: Builds the smart SKU and ensures 100% uniqueness
const generateSmartSku = async (baseDetails, color, size, localSkus) => {
    const { brandAbbr, collectionAbbr, categoryAbbr } = baseDetails;
    const colorAbbr = generateAbbreviation(color, 3);
    const sizeAbbr = generateAbbreviation(size, 3);

    // Build pattern: BRAND-COLLECTION-CATEGORY-COLOR-SIZE
    const segments = [brandAbbr, collectionAbbr];
    if (categoryAbbr) segments.push(categoryAbbr); // Drop category if undefined
    segments.push(colorAbbr, sizeAbbr);

    const baseSku = segments.filter(Boolean).join("-");
    let finalSku = baseSku;

    const Product = mongoose.model("Product");
    let isUnique = false;
    
    while (!isUnique) {
        // Check if SKU exists in the database OR in the current request payload
        const existsInDb = await Product.exists({ "variants.sizes.sku": finalSku });
        
        if (existsInDb || localSkus.has(finalSku)) {
            // Append 3 random digits to guarantee uniqueness on collision
            const randomDigits = Math.floor(100 + Math.random() * 900);
            finalSku = `${baseSku}-${randomDigits}`;
        } else {
            isUnique = true;
        }
    }
    
    localSkus.add(finalSku); // Register to prevent duplicates within the same form submission
    return finalSku;
};

export const checkSlugAvailability = asyncHandler(async (req, res) => {
    const { slug } = req.query;

    if (!slug || !String(slug).trim()) {
        return res.status(200).json(new ApiResponse(200, { available: false, slug: "" }, "Slug is required"));
    }

    const existingProduct = await Product.findOne({ slug: String(slug).trim() });

    return res.status(200).json(
        new ApiResponse(200, { available: !existingProduct, slug: String(slug).trim() }, existingProduct ? "Slug is already in use" : "Slug is available")
    );
});

export const createProduct = asyncHandler(async (req, res) => {
    const { name, slug, description, basePrice, thumbnail, variants, collectionRef, category } = req.body;

    if (!name || !slug || !description || basePrice === undefined || !thumbnail) {
        throw new ApiError(400, "Required fields are missing");
    }

   // --- NEW: Smart Slug Collision Handling ---
    let baseSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let finalSlug = baseSlug;
    let isSlugUnique = false;

    while (!isSlugUnique) {
        const existingProduct = await Product.findOne({ slug: finalSlug });
        if (existingProduct) {
            // If collision occurs, append a 4-digit random string (e.g. -4829)
            const randomDigits = Math.floor(1000 + Math.random() * 9000);
            finalSlug = `${baseSlug}-${randomDigits}`;
        } else {
            isSlugUnique = true;
        }
    }
    req.body.slug = finalSlug; // Safely overwrite the body with the guaranteed unique slug
    // ------------------------------------------

    // NEW: Smart SKU Generation & Pre-database Image validation
    if (variants && Array.isArray(variants)) {
        const brandAbbr = BRAND_SKU_ABBR;
        let collectionAbbr = "GEN"; // Default fallback
        
        // Fetch collection name for abbreviation if it exists
        if (collectionRef) {
            const Collection = mongoose.model("Collection");
            const col = await Collection.findById(collectionRef);
            if (col) collectionAbbr = generateAbbreviation(col.name, 3);
        }
        
        const categoryAbbr = generateAbbreviation(category, 3);
        const baseDetails = { brandAbbr, collectionAbbr, categoryAbbr };
        const localSkus = new Set(); // Tracks SKUs in this specific request

        for (const variant of variants) {
            // 1. Image Limit Validation
            if (variant.images && variant.images.length > 5) {
                throw new ApiError(400, `Maximum 5 images allowed per color variation. (Exceeded in color: ${variant.colorName || 'Unknown'})`);
            }
            
            // 2. Dynamic SKU Generation
            if (variant.sizes && Array.isArray(variant.sizes)) {
                for (const size of variant.sizes) {
                    // Only generate if SKU is missing or looks like generic user input (lacks dashes)
                    if (!size.sku || !size.sku.includes("-")) {
                        size.sku = await generateSmartSku(baseDetails, variant.colorName, size.size, localSkus);
                    } else {
                        // Register existing valid SKU to prevent accidental collisions in the loop
                        localSkus.add(size.sku); 
                    }
                }
            }
        }
    }

    const product = await Product.create(req.body);

    return res.status(201).json(new ApiResponse(201, product, "Product created successfully"));
});

export const getAllProducts = asyncHandler(async (req, res) => {
    const { search, collection, featured, published, stock, sort, dateRange, dateFrom, dateTo, page = 1, limit = 10 } = req.query;
    const isAdmin = req.user && req.user.role === "admin";
    
    const baseQuery = isAdmin ? { isDeleted: { $ne: true } } : { published: true, isDeleted: { $ne: true } };

    if (search) baseQuery.name = { $regex: search, $options: "i" };
    
    if (isAdmin) {
        if (published === 'true') baseQuery.published = true;
        if (published === 'false') baseQuery.published = { $ne: true }; 
        if (featured === 'true') baseQuery.isFeatured = true;
        if (featured === 'false') baseQuery.isFeatured = { $ne: true };
        if (stock === 'out') baseQuery.variants = { $elemMatch: { sizes: { $elemMatch: { stock: 0 } } } };
        if (stock === 'low') baseQuery.variants = { $elemMatch: { sizes: { $elemMatch: { stock: { $lt: 5, $gt: 0 } } } } };
    } else {
        if (featured === 'true') baseQuery.isFeatured = true;
    }

    const now = new Date();
    let rangeStart;
    let rangeEnd;
    if (dateRange === "today") {
        rangeStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        rangeEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    } else if (dateRange === "this_week") {
        rangeStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
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

    // NEW: Calculate product counts by collection using Aggregation
    const collectionCountsAgg = await Product.aggregate([
        { $match: baseQuery },
        { $group: { _id: "$collectionRef", count: { $sum: 1 } } }
    ]);

    const collectionCounts = {};
    let totalOverall = 0;
    collectionCountsAgg.forEach(item => {
        const key = item._id ? item._id.toString() : "unassigned";
        collectionCounts[key] = item.count;
        totalOverall += item.count;
    });
    collectionCounts.Total = totalOverall;

    // Apply the specific collection filter for the list
    const query = { ...baseQuery };
    if (collection) {
        if (collection === "unassigned") query.collectionRef = null;
        else query.collectionRef = collection;
    }

    const skip = (Number(page) - 1) * Number(limit);

    let sortOptions = { createdAt: -1 };
    if (sort === "price_asc") sortOptions = { basePrice: 1 };
    else if (sort === "price_desc") sortOptions = { basePrice: -1 };
    else if (sort === "bestselling") sortOptions = { soldCount: -1 };
    else if (sort === "featured") sortOptions = { isFeatured: -1, createdAt: -1 };

    const products = await Product.find(query)
        .populate("collectionRef", "name slug")
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit));

    const total = await Product.countDocuments(query);

    return res.status(200).json(new ApiResponse(200, {
        products,
        total,
        collectionCounts, // <-- Sending the calculated counts to the frontend
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
    }, "Products fetched successfully"));
});

export const getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // We populate the collection details for the frontend
    const product = await Product.findOne({ _id: id, isDeleted: { $ne: true } }).populate("collectionRef", "name slug");

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    return res.status(200).json(new ApiResponse(200, product, "Product fetched successfully"));
});

export const updateProductById = asyncHandler(async (req, res) => {
    const { variants, collectionRef, category } = req.body;

    // NEW: Smart SKU Generation & Pre-database Image validation
    if (variants && Array.isArray(variants)) {
        const brandAbbr = BRAND_SKU_ABBR;
        let collectionAbbr = "GEN"; 
        
        if (collectionRef) {
            const Collection = mongoose.model("Collection");
            const col = await Collection.findById(collectionRef);
            if (col) collectionAbbr = generateAbbreviation(col.name, 3);
        }
        
        const categoryAbbr = generateAbbreviation(category, 3);
        const baseDetails = { brandAbbr, collectionAbbr, categoryAbbr };
        const localSkus = new Set();

        for (const variant of variants) {
            // 1. Image Limit Validation
            if (variant.images && variant.images.length > 5) {
                throw new ApiError(400, `Maximum 5 images allowed per color variation. (Exceeded in color: ${variant.colorName || 'Unknown'})`);
            }
            
            // 2. Dynamic SKU Generation
            if (variant.sizes && Array.isArray(variant.sizes)) {
                for (const size of variant.sizes) {
                    if (!size.sku || !size.sku.includes("-")) {
                        size.sku = await generateSmartSku(baseDetails, variant.colorName, size.size, localSkus);
                    } else {
                        localSkus.add(size.sku);
                    }
                }
            }
        }
    }

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
    );
    
    if (!product) throw new ApiError(404, "Product not found");
    
    return res.status(200).json(new ApiResponse(200, product, "Product updated successfully"));
});

export const deleteProductById = asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndUpdate(
        req.params.id,
        { $set: { isDeleted: true } },
        { new: true }
    );
    if (!product) throw new ApiError(404, "Product not found");
    return res.status(200).json(new ApiResponse(200, {}, "Product moved to trash successfully"));
});

export const updateProductStock = asyncHandler(async (req, res) => {
    const { variantId, sizeId, stock } = req.body;
    const parsedStock = Number(stock);
    if (!variantId || !sizeId || !Number.isInteger(parsedStock) || parsedStock < 0) {
        throw new ApiError(400, "variantId, sizeId, and a non-negative integer stock value are required");
    }

    const product = await Product.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
    if (!product) throw new ApiError(404, "Product not found");
    const variant = product.variants.id(variantId);
    const size = variant?.sizes.id(sizeId);
    if (!size) throw new ApiError(404, "Product size variant not found");

    size.stock = parsedStock;
    await product.save();
    return res.status(200).json(new ApiResponse(200, product, "Stock updated successfully"));
});

export const toggleProductFeatured = asyncHandler(async (req, res) => {
    const product = await Product.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
    if (!product) throw new ApiError(404, "Product not found");
    product.isFeatured = !product.isFeatured;
    await product.save();
    return res.status(200).json(new ApiResponse(200, product, "Featured status updated successfully"));
});

export const toggleProductStatus = asyncHandler(async (req, res) => {
    const product = await Product.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
    if (!product) throw new ApiError(404, "Product not found");
    product.published = !product.published;
    await product.save();
    return res.status(200).json(new ApiResponse(200, product, "Publish status updated successfully"));
});

export const bulkUpdateProducts = asyncHandler(async (req, res) => {
    const { ids, action } = req.body;
    const validActions = ["publish", "draft", "delete"];
    if (!Array.isArray(ids) || ids.length === 0 || !validActions.includes(action)) {
        throw new ApiError(400, "ids and a valid bulk action are required");
    }

    const update = action === "publish"
        ? { $set: { published: true } }
        : action === "draft"
            ? { $set: { published: false } }
            : { $set: { isDeleted: true } };
    await Product.updateMany({ _id: { $in: ids }, isDeleted: { $ne: true } }, update);
    return res.status(200).json(new ApiResponse(200, {}, "Bulk product action completed successfully"));
});