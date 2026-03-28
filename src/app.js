import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import vendorRoutes from "./routes/vendor.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import vendorDashboardRoutes from "./routes/vendorDashboard.routes.js";
import adminDashboardRoutes from "./routes/adminDashboard.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";



const app = express();

// Use extended query parser to support nested query parameters
app.set("query parser", "extended");
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use('/api/auth', authRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/vendor-dashboard", vendorDashboardRoutes);
app.use("/api/admin-dashboard", adminDashboardRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/wishlist", wishlistRoutes);


// Health route
app.get("/", (req, res) => {
  res.status(200).json({ message: "Shoppingo API running..." });
});

// Global error handler
app.use(errorMiddleware);


export default app;

