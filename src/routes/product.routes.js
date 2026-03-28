import express from "express";
import { createProduct, getAllProducts,getSingleProduct } from "../controllers/product.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";
import { updateProduct } from "../controllers/product.controller.js";
import { deleteProduct } from "../controllers/product.controller.js";

const router = express.Router();

// Public routes
router.get("/", getAllProducts);
router.get("/:id", getSingleProduct);

// Vendor route
router.post(
  "/",
  protect,
  authorize("vendor"),
  upload.single("image"),
  createProduct
);
router.put(
  "/:id",
  protect,
  authorize("vendor"),
  updateProduct
);
router.delete(
  "/:id",
  protect,
  authorize("vendor"),
  deleteProduct
)



export default router;