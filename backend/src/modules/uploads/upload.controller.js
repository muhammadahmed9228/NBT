import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { imagekit } from "../../config/imagekit.js";

const getTransformedImageUrl = (url) => `${url}?tr=w-1000,q-80`;

export const uploadImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, "No image file provided");
    }
    
    try {
        const response = await imagekit.upload({
            file: req.file.buffer, // Provided by multer.memoryStorage
            fileName: req.file.originalname,
            folder: "/qala/products", // Optional: organizes new uploads in ImageKit dashboard
        });

        return res.status(200).json(new ApiResponse(200, {
            url: getTransformedImageUrl(response.url),
            fileId: response.fileId,
            name: response.name
        }, "Image uploaded successfully"));
    } catch (error) {
        console.error("ImageKit Upload Error:", error);
        throw new ApiError(500, "Image upload failed");
    }
});

export const deleteImage = asyncHandler(async (req, res) => {
    const { fileId } = req.params;
    
    if (!fileId) {
        throw new ApiError(400, "File ID is required");
    }

    try {
        await imagekit.deleteFile(fileId);
        return res.status(200).json(new ApiResponse(200, {}, "Image deleted successfully"));
    } catch (error) {
        console.error("ImageKit Delete Error:", error);
        throw new ApiError(500, "Image deletion failed. Verify the file ID.");
    }
});