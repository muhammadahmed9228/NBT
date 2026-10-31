import mongoose from "mongoose";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { Announcement } from "./announcement.model.js";

const HEX_COLOR = /^#([0-9A-Fa-f]{6})$/;

const isSafeLink = (link) => {
    const value = String(link || "").trim();
    if (!value) return true;
    if (value.startsWith("//") || value.includes("\\")) return false;
    if (value.startsWith("/")) return value.length === 1 || /^\/[A-Za-z0-9._~:/?#[\]@!$&'()*+,;=%-]*$/.test(value);
    try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
};

const sanitizeColor = (value, fallback) => (HEX_COLOR.test(String(value || "").trim()) ? String(value).trim() : fallback);

const sanitizeAnnouncement = (body) => {
    const message = String(body.message || "").trim();
    const link = String(body.link || "").trim();
    if (!message) throw new ApiError(400, "Announcement message is required");
    if (message.length > 240) throw new ApiError(400, "Announcement message cannot exceed 240 characters");
    if (link.length > 2048) throw new ApiError(400, "Announcement link is too long");
    if (!isSafeLink(link)) throw new ApiError(400, "Announcement link must be a relative path or HTTP(S) URL");

    return {
        message,
        link,
        activeStatus: Boolean(body.activeStatus),
        backgroundColor: sanitizeColor(body.backgroundColor, "#30251E"),
        textColor: sanitizeColor(body.textColor, "#D8C8B6")
    };
};

export const getActiveAnnouncement = asyncHandler(async (req, res) => {
    const announcement = await Announcement.findOne({ activeStatus: true }).sort({ updatedAt: -1 }).lean();
    return res.status(200).json(new ApiResponse(200, announcement, "Announcement fetched successfully"));
});

export const getAnnouncements = asyncHandler(async (req, res) => {
    const announcements = await Announcement.find().sort({ updatedAt: -1 });
    return res.status(200).json(new ApiResponse(200, announcements, "Announcements fetched successfully"));
});

export const upsertAnnouncement = asyncHandler(async (req, res) => {
    const payload = sanitizeAnnouncement(req.body);
    const id = req.body.id || req.body._id;
    let announcement;

    if (id) {
        if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid announcement id");
        announcement = await Announcement.findByIdAndUpdate(
            id,
            { $set: payload },
            { new: true, runValidators: true }
        );
        if (!announcement) throw new ApiError(404, "Announcement not found");
    } else {
        announcement = await Announcement.create(payload);
    }

    if (announcement.activeStatus) {
        await Announcement.updateMany(
            { _id: { $ne: announcement._id } },
            { $set: { activeStatus: false } }
        );
    }

    return res.status(200).json(new ApiResponse(200, announcement, "Announcement saved successfully"));
});

export const toggleAnnouncementStatus = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw new ApiError(400, "Invalid announcement id");
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) throw new ApiError(404, "Announcement not found");

    announcement.activeStatus = !announcement.activeStatus;
    await announcement.save();

    if (announcement.activeStatus) {
        await Announcement.updateMany(
            { _id: { $ne: announcement._id } },
            { $set: { activeStatus: false } }
        );
    }

    return res.status(200).json(new ApiResponse(200, announcement, `Announcement ${announcement.activeStatus ? "activated" : "deactivated"} successfully`));
});

export const deleteAnnouncement = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw new ApiError(400, "Invalid announcement id");
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) throw new ApiError(404, "Announcement not found");
    return res.status(200).json(new ApiResponse(200, {}, "Announcement deleted successfully"));
});
