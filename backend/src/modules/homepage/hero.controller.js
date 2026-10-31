import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { HeroSlide } from "./hero.model.js";

export const createHeroSlide = asyncHandler(async (req, res) => {
    const { image, heading, subtitle, buttonText, buttonUrl, enabled, displayOrder } = req.body;

    if (!image?.url || !image?.fileId || !heading) {
        throw new ApiError(400, "Image and heading are required");
    }

    const slide = await HeroSlide.create({
        image,
        heading,
        subtitle,
        buttonText,
        buttonUrl,
        enabled,
        displayOrder,
    });

    return res.status(201).json(new ApiResponse(201, slide, "Hero slide created successfully"));
});

export const getHeroSlides = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, sort = "order_asc" } = req.query;
    const isAdmin = req.user && req.user.role === "admin";
    
    // Public users only see enabled slides; Admins see all slides to manage them
    const filter = isAdmin ? {} : { enabled: true };

    const skip = (Number(page) - 1) * Number(limit);

    // Advanced Sorting Logic
    let sortOptions = { displayOrder: 1, createdAt: -1 }; // Default
    if (sort === "order_desc") sortOptions = { displayOrder: -1, createdAt: -1 };
    if (sort === "newest") sortOptions = { createdAt: -1 };
    if (sort === "oldest") sortOptions = { createdAt: 1 };
    if (sort === "status_enabled") sortOptions = { enabled: -1, displayOrder: 1 }; // Booleans: -1 brings True to top
    if (sort === "status_disabled") sortOptions = { enabled: 1, displayOrder: 1 }; // Booleans: 1 brings False to top
    
   const slides = await HeroSlide.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit));
        
    const total = await HeroSlide.countDocuments(filter);

    return res.status(200).json(new ApiResponse(200, {
        slides, 
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
    }, "Hero slides fetched successfully"));
});

export const updateHeroSlide = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const slide = await HeroSlide.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true, runValidators: true }
    );

    if (!slide) throw new ApiError(404, "Hero slide not found");

    return res.status(200).json(new ApiResponse(200, slide, "Hero slide updated successfully"));
});

export const deleteHeroSlide = asyncHandler(async (req, res) => {
    const slide = await HeroSlide.findByIdAndDelete(req.params.id);
    
    if (!slide) throw new ApiError(404, "Hero slide not found");

    // Note: The actual ImageKit file deletion should ideally happen here using the upload.controller logic,
    // but we will keep it simple and return the fileId so the frontend can delete it via the uploads API.

    return res.status(200).json(new ApiResponse(200, { fileId: slide.image.fileId }, "Hero slide deleted successfully"));
});