import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB, { isConnected } from "./config/db.js";

app.use(async (req, res, next) => {
  try {
    if (!isConnected) {
      await connectDB();
    }
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database connection failed"
    });
  }
});

export default app;