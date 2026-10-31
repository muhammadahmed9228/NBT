import { Router } from "express";
import { getSections, createSection, updateSection, deleteSection } from "./section.controller.js";
import { optionalAuth, verifyJWT, authorizeAdmin } from "../../middleware/auth.middleware.js";

const router = Router();
router.route("/").get(optionalAuth, getSections);
router.use(verifyJWT, authorizeAdmin);
router.route("/").post(createSection);
router.route("/:id").patch(updateSection).delete(deleteSection);
export default router;