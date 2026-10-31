import { Router } from "express";
import {
    createHeroSlide,
    getHeroSlides,
    updateHeroSlide,
    deleteHeroSlide
} from "./hero.controller.js";
import { optionalAuth, verifyJWT, authorizeAdmin } from "../../middleware/auth.middleware.js";

const router = Router();

// Public route (optionalAuth allows admins to be identified so they can see disabled slides)
router.route("/hero-slides").get(optionalAuth, getHeroSlides);

// Admin-only routes
router.use(verifyJWT, authorizeAdmin);
router.route("/hero-slides").post(createHeroSlide);
router.route("/hero-slides/:id").patch(updateHeroSlide).delete(deleteHeroSlide);

export default router;