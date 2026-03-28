import express from "express";

import {
  getVendorProducts,
  getVendorOrders,
  getVendorRevenue,
  getVendorDashboard
} from "../controllers/vendorDashboard.controller.js";

import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/dashboard", protect, authorize("vendor"), getVendorDashboard);

router.get("/products", protect, authorize("vendor"), getVendorProducts);

router.get("/orders", protect, authorize("vendor"), getVendorOrders);

router.get("/revenue", protect, authorize("vendor"), getVendorRevenue);

export default router;