import mongoose, { Schema } from "mongoose";

const announcementSchema = new Schema(
    {
        message: { type: String, required: true, trim: true, maxlength: 240 },
        link: { type: String, trim: true, default: "", maxlength: 2048 },
        activeStatus: { type: Boolean, default: true },
        backgroundColor: { type: String, default: "#30251E", trim: true },
        textColor: { type: String, default: "#D8C8B6", trim: true }
    },
    { timestamps: true }
);

announcementSchema.index({ activeStatus: 1, updatedAt: -1 });

export const Announcement = mongoose.model("Announcement", announcementSchema);
