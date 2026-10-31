import multer from "multer";

const storage = multer.memoryStorage();

const allowedImageTypes = new Map([
    ["image/jpeg", [".jpg", ".jpeg"]],
    ["image/png", [".png"]],
    ["image/webp", [".webp"]],
]);

export const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const extension = file.originalname
            .slice(file.originalname.lastIndexOf("."))
            .toLowerCase();
        const allowedExtensions = allowedImageTypes.get(file.mimetype);

        if (allowedExtensions?.includes(extension)) {
            cb(null, true);
        } else {
            cb(new Error("Only JPG, JPEG, PNG, and WEBP images are allowed"), false);
        }
    }
});