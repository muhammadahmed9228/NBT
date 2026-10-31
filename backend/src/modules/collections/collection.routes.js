import { Router } from "express";
import {
    createCollection,
    getCollections,
    updateCollection,
    deleteCollection,
    getCollectionBySlug
} from "./collection.controller.js";
import { optionalAuth, verifyJWT, authorizeAdmin } from "../../middleware/auth.middleware.js";

const router = Router();

// Public read access
router.route("/").get(optionalAuth, getCollections);
router.route("/slug/:slug").get(getCollectionBySlug);

// Admin exclusive routes
router.use(verifyJWT, authorizeAdmin);
router.route("/").post(createCollection);
router.route("/:id").patch(updateCollection).delete(deleteCollection);

export default router;