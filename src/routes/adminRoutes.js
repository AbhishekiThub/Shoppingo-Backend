import express from "express";

import {
  getAdminDashboard,
  getMonthlySales,
  getTopProducts
} from "../controllers/adminDashboard.controller.js";

import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/dashboard", protect, authorize("admin"), getAdminDashboard);

router.get("/sales", protect, authorize("admin"), getMonthlySales);

router.get("/top-products", protect, authorize("admin"), getTopProducts);

export default router;