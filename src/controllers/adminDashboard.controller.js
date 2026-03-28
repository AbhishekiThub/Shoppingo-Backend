import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import asyncHandler from "../utils/asyncHandler.js";


// ADMIN DASHBOARD SUMMARY
export const getAdminDashboard = asyncHandler(async (req, res) => {

  const totalUsers = await User.countDocuments({ role: "user" });
  const totalVendors = await User.countDocuments({ role: "vendor" });

  const totalProducts = await Product.countDocuments();

  const orders = await Order.find();

  const totalOrders = orders.length;

  let totalRevenue = 0;

  orders.forEach(order => {
    if (order.orderStatus === "delivered") {
      totalRevenue += order.totalPrice;
    }
  });

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalVendors,
      totalProducts,
      totalOrders,
      totalRevenue
    }
  });

});

// MONTHLY SALES
export const getMonthlySales = asyncHandler(async (req, res) => {

  const salesData = await Order.aggregate([
    {
      $match: { orderStatus: "delivered" }
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        revenue: { $sum: "$totalPrice" },
        orders: { $sum: 1 }
      }
    },
    {
      $sort: { "_id": 1 }
    }
  ]);

  res.status(200).json({
    success: true,
    salesData
  });

});

// TOP PRODUCTS
export const getTopProducts = asyncHandler(async (req, res) => {

  const topProducts = await Order.aggregate([
    { $unwind: "$orderItems" },

    {
      $group: {
        _id: "$orderItems.product",
        totalSold: { $sum: "$orderItems.quantity" }
      }
    },

    {
      $sort: { totalSold: -1 }
    },

    {
      $limit: 5
    }
  ]);

  const populatedProducts = await Product.populate(topProducts, {
    path: "_id",
    select: "name price images"
  });

  res.status(200).json({
    success: true,
    topProducts: populatedProducts
  });

});