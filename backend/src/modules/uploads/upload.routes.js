import { Router } from "express";
import { uploadImage, deleteImage } from "./upload.controller.js";
import { verifyJWT, authorizeAdmin } from "../../middleware/auth.middleware.js";
import { upload } from "../../middleware/multer.middleware.js";

const router = Router();

// Image management is strictly for admins
router.use(verifyJWT, authorizeAdmin);

// Form field name expected from frontend is "image"
router.route("/images").post(upload.single("image"), uploadImage);
router.route("/images/:fileId").delete(deleteImage);

export default router;