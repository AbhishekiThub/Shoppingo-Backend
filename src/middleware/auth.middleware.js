import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/user.model.js";


export const protect = asyncHandler(async (req, res, next) => { let token; if (req.headers.authorization?.startsWith("Bearer")) { token = req.headers.authorization.split(" ")[1]; } if (!token) { throw new ApiError(401, "Not authorized"); } try { const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET); const user = await User.findById(decoded.id).select("-password"); if (!user) { throw new ApiError(401, "User not found"); } req.user = user; next(); } catch (error) { if (error.name === "TokenExpiredError") { return res.status(401).json({ success: false, message: "Access token expired" }); } return res.status(401).json({ success: false, message: "Invalid token" }); } }); // Role based authorization middleware 
export const authorize = (...roles) => { return (req, res, next) => { if (!roles.includes(req.user.role)) { throw new ApiError(403, "Forbidden: Insufficient permissions"); } next(); }; };
