import mongoose from "mongoose";

const vendorOrderSchema = new mongoose.Schema(
  {
    parentOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true
    },

    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        name: String,
        quantity: Number,
        price: Number,
        image: String
      }
    ],

    shippingAddress: {
      address: String,
      city: String,
      postalCode: String,
      country: String
    },

    paymentMethod: {
      type: String,
      default: "COD"
    },

    subtotal: {
      type: Number,
      required: true
    },

    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending"
    },

    deliveredAt: Date
  },
  { timestamps: true }
);

export default mongoose.model("VendorOrder", vendorOrderSchema);