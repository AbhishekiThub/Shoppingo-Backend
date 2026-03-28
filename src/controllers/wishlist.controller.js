import Wishlist from "../models/wishlist.model.js";
import asyncHandler from "../utils/asyncHandler.js";


// ADD TO WISHLIST
export const addToWishlist = asyncHandler(async (req, res) => {

  try {

    const { productId } = req.params;

    // console.log("USER:", req.user?._id);
    // console.log("PRODUCT:", productId);

    const wishlistItem = await Wishlist.create({
      user: req.user._id,
      product: productId
    });

    res.status(201).json({
      success: true,
      message: "Product added to wishlist",
      wishlistItem
    });

  } catch (error) {

    console.log("WISHLIST ERROR:", error);

    throw error;

  }

});

// GET USER WISHLIST
export const getWishlist = asyncHandler(async (req, res) => {

  const wishlist = await Wishlist.find({ user: req.user._id })
    .populate("product");

  res.status(200).json({
    success: true,
    count: wishlist.length,
    wishlist
  });

});


// REMOVE FROM WISHLIST
export const removeFromWishlist = asyncHandler(async (req, res) => {

  const { productId } = req.params;

  await Wishlist.findOneAndDelete({
    user: req.user._id,
    product: productId
  });

  res.status(200).json({
    success: true,
    message: "Product removed from wishlist"
  });

});