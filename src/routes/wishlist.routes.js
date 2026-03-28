import express from "express";

import {
  addToWishlist,
  getWishlist,
  removeFromWishlist
} from "../controllers/wishlist.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/add/:productId", protect, addToWishlist);

router.get("/", protect, getWishlist);

router.delete("/remove/:productId", protect, removeFromWishlist);

export default router;