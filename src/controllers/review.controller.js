import Product from "../models/product.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";


// ADD / UPDATE REVIEW
export const addReview = asyncHandler(async (req, res) => {

  const { rating, comment } = req.body;
  const { productId } = req.params;

  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const existingReview = product.reviews.find(
    review => review.user.toString() === req.user._id.toString()
  );

  if (existingReview) {

    existingReview.rating = rating;
    existingReview.comment = comment;

  } else {

    product.reviews.push({
      user: req.user._id,
      name: req.user.name,
      rating,
      comment
    });

    product.numReviews = product.reviews.length;
  }

  const totalRating = product.reviews.reduce(
    (sum, review) => sum + review.rating,
    0
  );

  product.averageRating = totalRating / product.reviews.length;

  await product.save();

  res.status(200).json({
    success: true,
    message: "Review added/updated"
  });

});


// GET PRODUCT REVIEWS
export const getProductReviews = asyncHandler(async (req, res) => {

  const product = await Product.findById(req.params.productId)
    .populate("reviews.user", "name");

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews
  });

});


// DELETE REVIEW
export const deleteReview = asyncHandler(async (req, res) => {

  const { productId } = req.params;

  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  product.reviews = product.reviews.filter(
    review => review.user.toString() !== req.user._id.toString()
  );

  product.numReviews = product.reviews.length;

  const totalRating = product.reviews.reduce(
    (sum, review) => sum + review.rating,
    0
  );

  product.averageRating =
    product.reviews.length === 0
      ? 0
      : totalRating / product.reviews.length;

  await product.save();

  res.status(200).json({
    success: true,
    message: "Review deleted"
  });

});