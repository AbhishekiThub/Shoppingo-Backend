import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";


//  CREATE ORDER
export const createOrder = asyncHandler(async (req, res) => {

  const { orderItems, shippingAddress, paymentMethod } = req.body;

  if (!orderItems || orderItems.length === 0) {
    throw new ApiError(400, "No order items");
  }

  let totalPrice = 0;

  for (const item of orderItems) {

    const product = await Product.findById(item.product);

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    if (product.stock < item.quantity) {
      throw new ApiError(400, `${product.name} out of stock`);
    }

    product.stock -= item.quantity;
    await product.save();

    item.price = product.price;
    item.name = product.name;
    item.image = product.images[0]?.url;
    item.vendor = product.vendor;

    totalPrice += product.price * item.quantity;
  }

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    totalPrice
  });

  res.status(201).json({
    success: true,
    order
  });
});


//  USER ORDERS
export const getMyOrders = asyncHandler(async (req, res) => {

  const orders = await Order.find({
    user: req.user._id
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    orders
  });
});


//  ADMIN ORDERS
export const getAllOrders = asyncHandler(async (req, res) => {

  const orders = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    orders
  });
});


// UPDATE ORDER STATUS
export const updateOrderStatus = asyncHandler(async (req, res) => {

  const { status } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  order.orderStatus = status;

  if (status === "delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save();

  res.status(200).json({
    success: true,
    order
  });
});