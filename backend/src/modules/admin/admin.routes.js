import { Router } from "express";
import { getDashboardStats } from "./admin.controller.js";
import { verifyJWT, authorizeAdmin } from "../../middleware/auth.middleware.js";

const router = Router();

// All admin routes strictly require authentication and admin authorization
router.use(verifyJWT, authorizeAdmin);

router.route("/dashboard").get(getDashboardStats);

export default router;