import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    description: {
      type: String,
      required: true
    },

    price: {
      type: Number,
      required: true
    },

    stock: {
      type: Number,
      required: true
    },

    category: {
      type: String,
      required: true,
      enum: [             //Lock categories properly to prevent random bad categories from frontend
        "Electronics",
        "Male Fashion",
        "Female Fashion",
        "Mobiles",
        "Appliances",
        "Books",
        "Beauty",
        "Toys",
        "Grocery",
        "Furniture",
        "Sports",
        "Home Decor",
        "Automotive",
        "Utensils",
        "Stationery",
        "Kids Fashion"
      ]
    },

    images: [
      {
        public_id: String,
        url: String
      }
    ],

    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // REVIEWS
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true
        },
        name: String,
        rating: {
          type: Number,
          required: true
        },
        comment: String
      }
    ],

    numReviews: {
      type: Number,
      default: 0
    },

    averageRating: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);