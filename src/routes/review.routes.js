import express from "express";

import {
  addReview,
  getProductReviews,
  deleteReview
} from "../controllers/review.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/:productId", protect, addReview);

router.get("/:productId", getProductReviews);

router.delete("/:productId", protect, deleteReview);

export default router;