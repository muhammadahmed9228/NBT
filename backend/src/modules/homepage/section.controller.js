import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { HomeSection } from "./section.model.js";

export const getSections = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, sort = "order_asc" } = req.query;
    const isAdmin = req.user && req.user.role === "admin";
    const filter = isAdmin ? {} : { enabled: true };

    const skip = (Number(page) - 1) * Number(limit);

    let sortOptions = { displayOrder: 1, createdAt: -1 };
    if (sort === "order_desc") sortOptions = { displayOrder: -1, createdAt: -1 };
    if (sort === "newest") sortOptions = { createdAt: -1 };
    if (sort === "oldest") sortOptions = { createdAt: 1 };
    if (sort === "status_enabled") sortOptions = { enabled: -1, displayOrder: 1 };
    if (sort === "status_disabled") sortOptions = { enabled: 1, displayOrder: 1 };

    const sections = await HomeSection.find(filter)
        .populate("collectionRef", "name slug")
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit));
        
    const total = await HomeSection.countDocuments(filter);

    return res.status(200).json(new ApiResponse(200, {
        sections, 
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
    }, "Sections fetched"));
});


const normalizeHomeSectionPayload = (payload = {}) => {
    const nextPayload = { ...payload };

    if (nextPayload.criteria !== "collection" || !nextPayload.collectionRef || String(nextPayload.collectionRef).trim() === "") {
        nextPayload.collectionRef = null;
    }

    return nextPayload;
};

export const createSection = asyncHandler(async (req, res) => {
    const section = await HomeSection.create(normalizeHomeSectionPayload(req.body));
    return res.status(201).json(new ApiResponse(201, section, "Section created"));
});

export const updateSection = asyncHandler(async (req, res) => {
    const section = await HomeSection.findByIdAndUpdate(req.params.id, normalizeHomeSectionPayload(req.body), { new: true });
    return res.status(200).json(new ApiResponse(200, section, "Section updated"));
});

export const deleteSection = asyncHandler(async (req, res) => {
    await HomeSection.findByIdAndDelete(req.params.id);
    return res.status(200).json(new ApiResponse(200, {}, "Section deleted"));
});