import express from "express";
import {
  applyVendor,
  getAllVendorRequests,
  updateVendorStatus,
  getVendorOrders,
  updateVendorOrderStatus
} from "../controllers/vendor.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { getVendorProducts } from "../controllers/product.controller.js";

const router = express.Router();

// User applies
router.post("/apply", protect, applyVendor);

// Admin views requests
router.get("/", protect, authorize("admin"), getAllVendorRequests);

// Admin approves/rejects
router.put("/:id", protect, authorize("admin"), updateVendorStatus);

// Vendor products
router.get("/products", protect, authorize("vendor"), getVendorProducts);

// Vendor orders
router.get("/orders", protect, authorize("vendor"), getVendorOrders);
router.put(
  "/orders/:id/status",
  protect,
  authorize("vendor"),
  updateVendorOrderStatus
);

export default router;




// import express from "express";
// import {
//   applyVendor,
//   getAllVendorRequests,
//   updateVendorStatus
// } from "../controllers/vendor.controller.js";
// import { protect, authorize } from "../middleware/auth.middleware.js";
// import { getVendorProducts } from "../controllers/product.controller.js";

// const router = express.Router();

// // User applies
// router.post("/apply", protect, applyVendor);

// // Admin views requests
// router.get("/", protect, authorize("admin"), getAllVendorRequests);

// // Admin approves/rejects
// router.put("/:id", protect, authorize("admin"), updateVendorStatus);

// router.get(
//   "/products",
//   protect,
//   authorize("vendor"),
//   getVendorProducts
// );



// export default router;