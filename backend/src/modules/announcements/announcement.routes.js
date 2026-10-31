import { Router } from "express";
import { getActiveAnnouncement, getAnnouncements, upsertAnnouncement, toggleAnnouncementStatus, deleteAnnouncement } from "./announcement.controller.js";
import { verifyJWT, authorizeAdmin } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/active", getActiveAnnouncement);
router.use(verifyJWT, authorizeAdmin);
router.get("/", getAnnouncements);
router.put("/", upsertAnnouncement);
router.post("/", upsertAnnouncement);
router.patch("/:id/toggle-status", toggleAnnouncementStatus);
router.delete("/:id", deleteAnnouncement);

export default router;
