import { Router } from "express";
import { getAllCustomers } from "./customer.controller.js";
import { verifyJWT, authorizeAdmin } from "../../middleware/auth.middleware.js";

const router = Router();

// Strictly admin only
router.use(verifyJWT, authorizeAdmin);
router.route("/").get(getAllCustomers);

export default router;