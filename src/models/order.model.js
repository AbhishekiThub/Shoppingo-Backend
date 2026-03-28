import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
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
        image: String,
        vendor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        }
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

    totalPrice: {
      type: Number,
      required: true
    },

    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "shipped",
        "delivered",
        "cancelled"
      ],
      default: "pending"
    },
    
    trackingId: {
      type: String,
      unique: true
    },

    paymentInfo: {
      razorpay_order_id: String,
      razorpay_payment_id: String
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "paid"
    },

    paidAt: Date,
    deliveredAt: Date
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);




// import mongoose from "mongoose";

// const orderSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true
//     },

//     orderItems: [
//       {
//         product: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Product",
//           required: true
//         },
//         name: String,
//         quantity: Number,
//         price: Number,
//         image: String,
//         vendor: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "User"
//         }
//       }
//     ],

//     shippingAddress: {
//       address: String,
//       city: String,
//       postalCode: String,
//       country: String
//     },

//     paymentMethod: {
//       type: String,
//       default: "COD"
//     },

//     totalPrice: {
//       type: Number,
//       required: true
//     },

//     orderStatus: {
//       type: String,
//       enum: [
//         "pending",
//         "confirmed",
//         "shipped",
//         "delivered",
//         "cancelled"
//       ],
//       default: "pending"
//     },

//     paymentInfo: {
//       razorpay_order_id: String,
//       razorpay_payment_id: String
//     },

//     paymentStatus: {
//       type: String,
//       enum: ["pending", "paid", "failed"],
//       default: "paid"
//     },

//     paidAt: Date,
//     deliveredAt: Date
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Order", orderSchema);
