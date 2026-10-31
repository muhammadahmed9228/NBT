import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { Collection } from "./collection.model.js";

export const createCollection = asyncHandler(async (req, res) => {
    const { name, slug, description, image, enabled, displayOrder } = req.body;

    const existing = await Collection.findOne({ slug });
    if (existing) throw new ApiError(400, "Collection with this slug already exists");

    const collection = await Collection.create({
        name, slug, description, image, enabled, displayOrder
    });

    return res.status(201).json(new ApiResponse(201, collection, "Collection created successfully"));
});

export const getCollections = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, sort = "order_asc", status } = req.query;
    const isAdmin = req.user && req.user.role === "admin";
    
    const filter = isAdmin ? {} : { enabled: true };
    
    // Apply Admin status filter
    if (isAdmin && status) {
        if (status === "active") filter.enabled = true;
        if (status === "inactive") filter.enabled = false;
    }

    const skip = (Number(page) - 1) * Number(limit);

    let sortOptions = { displayOrder: 1, createdAt: -1 };
    if (sort === "order_desc") sortOptions = { displayOrder: -1, createdAt: -1 };
    if (sort === "newest") sortOptions = { createdAt: -1 };
    if (sort === "oldest") sortOptions = { createdAt: 1 };
    if (sort === "name_asc") sortOptions = { name: 1 };
    if (sort === "name_desc") sortOptions = { name: -1 };

    const collections = await Collection.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit));

    const total = await Collection.countDocuments(filter);

    return res.status(200).json(new ApiResponse(200, {
        collections, 
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
    }, "Collections fetched successfully"));
});

export const updateCollection = asyncHandler(async (req, res) => {
    const collection = await Collection.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
    );

    if (!collection) throw new ApiError(404, "Collection not found");
    return res.status(200).json(new ApiResponse(200, collection, "Collection updated successfully"));
});

export const deleteCollection = asyncHandler(async (req, res) => {
    const collection = await Collection.findByIdAndDelete(req.params.id);
    if (!collection) throw new ApiError(404, "Collection not found");
    
    // Note: If you want to prevent deletion when products are linked, 
    // you would query the Product model here and throw an error if count > 0.
    
    return res.status(200).json(new ApiResponse(200, {}, "Collection deleted successfully"));
});

export const getCollectionBySlug = asyncHandler(async (req, res) => {
    const collection = await Collection.findOne({ slug: req.params.slug, enabled: true });
    
    if (!collection) throw new ApiError(404, "Collection not found");
    
    return res.status(200).json(new ApiResponse(200, collection, "Collection fetched successfully"));
});