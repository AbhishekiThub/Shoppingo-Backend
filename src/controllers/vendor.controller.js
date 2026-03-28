import Vendor from "../models/vendor.model.js";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import mongoose from "mongoose";
import VendorOrder from "../models/vendorOrder.model.js";

// APPLY FOR VENDOR
export const applyVendor = asyncHandler(async (req, res) => {
  const { businessName, businessEmail, phone, address, gstNumber } = req.body;

  if (!businessName || !businessEmail || !phone || !address) {
    throw new ApiError(400, "All required fields must be filled");
  }

  const existingApplication = await Vendor.findOne({ user: req.user._id });

  if (existingApplication) {
    throw new ApiError(400, "You have already applied");
  }

  const vendor = await Vendor.create({
    user: req.user._id,
    businessName,
    businessEmail,
    phone,
    address,
    gstNumber
  });

  res.status(201).json({
    success: true,
    message: "Vendor application submitted",
    vendor
  });
});

// ADMIN – GET ALL VENDOR REQUESTS
export const getAllVendorRequests = asyncHandler(async (req, res) => {
  const vendors = await Vendor.find().populate("user", "name email");

  res.status(200).json({
    success: true,
    vendors
  });
});

// ADMIN – APPROVE / REJECT
export const updateVendorStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  if (!["approved", "rejected"].includes(status)) {
    throw new ApiError(400, "Invalid status value");
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid vendor ID");
  }

  const vendor = await Vendor.findById(id);

  if (!vendor) {
    throw new ApiError(404, "Vendor request not found");
  }

  vendor.status = status;
  await vendor.save();

  if (status === "approved") {
    await User.findByIdAndUpdate(vendor.user, {
      role: "vendor"
    });
  }

  res.status(200).json({
    success: true,
    message: `Vendor ${status} successfully`
  });
});

// VENDOR – GET OWN ORDERS
export const getVendorOrders = asyncHandler(async (req, res) => {
  const orders = await VendorOrder.find({ vendor: req.user._id })
    .populate("customer", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    orders
  });
});

export const updateVendorOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  const allowedStatuses = ["confirmed", "shipped", "delivered", "cancelled"];

  if (!allowedStatuses.includes(status)) {
    throw new ApiError(400, "Invalid status");
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid vendor order ID");
  }

  const vendorOrder = await VendorOrder.findById(id);

  if (!vendorOrder) {
    throw new ApiError(404, "Vendor order not found");
  }

  if (vendorOrder.vendor.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not allowed");
  }

  vendorOrder.orderStatus = status;

  if (status === "delivered") {
    vendorOrder.deliveredAt = Date.now();
  } else {
    vendorOrder.deliveredAt = null;
  }

  await vendorOrder.save();

  // UPDATE PARENT ORDER STATUS
  const siblingVendorOrders = await VendorOrder.find({
    parentOrder: vendorOrder.parentOrder
  });

  const statuses = siblingVendorOrders.map((order) => order.orderStatus);

  let parentStatus = "pending";

  if (statuses.every((s) => s === "cancelled")) {
    parentStatus = "cancelled";
  } else if (statuses.every((s) => s === "delivered")) {
    parentStatus = "delivered";
  } else if (statuses.some((s) => s === "shipped" || s === "delivered")) {
    parentStatus = "shipped";
  } else if (statuses.some((s) => s === "confirmed")) {
    parentStatus = "confirmed";
  } else {
    parentStatus = "pending";
  }

  const parentOrder = await Order.findById(vendorOrder.parentOrder);

  if (parentOrder) {
    parentOrder.orderStatus = parentStatus;

    if (parentStatus === "delivered") {
      parentOrder.deliveredAt = Date.now();
    } else {
      parentOrder.deliveredAt = null;
    }

    await parentOrder.save();
  }

  res.status(200).json({
    success: true,
    message: "Vendor order status updated successfully",
    order: vendorOrder
  });
}); 

