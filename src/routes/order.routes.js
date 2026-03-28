import express from "express";

import {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus
} from "../controllers/order.controller.js";

import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createOrder);

router.get("/my-orders", protect, getMyOrders);

router.get("/", protect, authorize("admin"), getAllOrders);

router.put("/:id", protect, authorize("admin"), updateOrderStatus);

export default router;