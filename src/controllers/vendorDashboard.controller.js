import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import asyncHandler from "../utils/asyncHandler.js";


// GET VENDOR PRODUCTS
export const getVendorProducts = asyncHandler(async (req, res) => {

  const products = await Product.find({
    vendor: req.user._id
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    totalProducts: products.length,
    products
  });

});

// GET VENDOR ORDERS
export const getVendorOrders = asyncHandler(async (req, res) => {

  const orders = await Order.find({
    "orderItems.vendor": req.user._id
  })
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    totalOrders: orders.length,
    orders
  });

});

// VENDOR REVENUE
export const getVendorRevenue = asyncHandler(async (req, res) => {

  const orders = await Order.find({
    orderStatus: "delivered",
    "orderItems.vendor": req.user._id
  });

  let revenue = 0;
  let totalSales = 0;

  orders.forEach(order => {

    order.orderItems.forEach(item => {

      if (item.vendor.toString() === req.user._id.toString()) {

        revenue += item.price * item.quantity;
        totalSales += item.quantity;

      }

    });

  });

  res.status(200).json({
    success: true,
    revenue,
    totalSales
  });

});

// DASHBOARD SUMMARY
export const getVendorDashboard = asyncHandler(async (req, res) => {

  const totalProducts = await Product.countDocuments({
    vendor: req.user._id
  });

  const orders = await Order.find({
    "orderItems.vendor": req.user._id
  });

  let revenue = 0;
  let totalOrders = orders.length;

  orders.forEach(order => {

    order.orderItems.forEach(item => {

      if (item.vendor.toString() === req.user._id.toString()) {

        revenue += item.price * item.quantity;

      }

    });

  });

  res.status(200).json({
    success: true,
    data: {
      totalProducts,
      totalOrders,
      revenue
    }
  });

});