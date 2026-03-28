import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";


//  ADD TO CART
export const addToCart = asyncHandler(async (req, res) => {

  const { productId, quantity } = req.body;

  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      items: []
    });
  }

  const itemIndex = cart.items.findIndex(
    item => item.product.toString() === productId
  );

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({
      product: productId,
      quantity
    });
  }

  await cart.save();

  res.status(200).json({
    success: true,
    cart
  });

});


//  GET USER CART
export const getCart = asyncHandler(async (req, res) => {

  const cart = await Cart.findOne({ user: req.user._id })
    .populate("items.product");

  res.status(200).json({
    success: true,
    cart
  });

});


//  REMOVE ITEM
export const removeCartItem = asyncHandler(async (req, res) => {

  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  cart.items = cart.items.filter(
    item => item.product.toString() !== productId
  );

  await cart.save();

  res.status(200).json({
    success: true,
    cart
  });

});


//  UPDATE QUANTITY
export const updateQuantity = asyncHandler(async (req, res) => {

  const { quantity } = req.body;
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  const item = cart.items.find(
    item => item.product.toString() === productId
  );

  if (!item) {
    throw new ApiError(404, "Item not found in cart");
  }

  item.quantity = quantity;

  await cart.save();

  res.status(200).json({
    success: true,
    cart
  });

});