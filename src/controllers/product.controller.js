import Product from "../models/product.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import cloudinary from "../config/cloudinary.js";
import APIFeatures from "../utils/apiFeatures.js";

// ==============================
// CREATE PRODUCT (Vendor Only)
// ==============================
export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, stock, category } = req.body;

  if (!name || !description || !price || !stock || !category) {
    throw new ApiError(400, "All fields are required");
  }

  if (!req.file) {
    throw new ApiError(400, "Product image is required");
  }

  // Wrap upload_stream in Promise
  const uploadToCloudinary = () => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "shoppingo/products" },
        (error, result) => {
          if (error) {
            reject(new ApiError(500, "Image upload failed"));
          } else {
            resolve(result);
          }
        }
      );

      stream.end(req.file.buffer);
    });
  };

  const result = await uploadToCloudinary();

  const product = await Product.create({
    name,
    description,
    price,
    stock,
    category,
    images: [
      {
        public_id: result.public_id,
        url: result.secure_url
      }
    ],
    vendor: req.user._id
  });

  res.status(201).json({
    success: true,
    product
  });
});

// GET ALL PRODUCTS with SEARCH, FILTER, SORT, PAGINATION
export const getAllProducts = asyncHandler(async (req, res) => {

  const resultPerPage = 9;

  const apiFeatures = new APIFeatures(Product.find(), req.query)
    .search()
    .filter()
    .sort()
    .paginate(resultPerPage);

  const products = await apiFeatures.query;

  res.status(200).json({
    success: true,
    count: products.length,
    products
  });

});

// GET SINGLE PRODUCT

export const getSingleProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("vendor", "name email");

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  res.status(200).json({
    success: true,
    product
  });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Vendor can only update their own product
  if (product.vendor.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to update this product");
  }

  const { name, description, price, stock, category } = req.body;

  product.name = name || product.name;
  product.description = description || product.description;
  product.price = price || product.price;
  product.stock = stock || product.stock;
  product.category = category || product.category;

  const updatedProduct = await product.save();

  res.status(200).json({
    success: true,
    product: updatedProduct
  });
});

// DELETE PRODUCT + DELETE IMAGE FROM CLOUDINARY
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (product.vendor.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to delete this product");
  }

  // Delete image from Cloudinary
  for (const image of product.images) {
    await cloudinary.uploader.destroy(image.public_id);
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: "Product deleted successfully"
  });
});

// Vendor should see their own products
export const getVendorProducts = asyncHandler(async (req, res) => {

  const products = await Product.find({
    vendor: req.user._id
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: products.length,
    products
  });

});
