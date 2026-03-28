import razorpay from "../config/razorpay.js";
import crypto from "crypto";
import asyncHandler from "../utils/asyncHandler.js";
import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import VendorOrder from "../models/vendorOrder.model.js";
import sendEmail from "../utils/sendEmail.js";

// CREATE RAZORPAY ORDER
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  const options = {
    amount: amount * 100,
    currency: "INR",
    receipt: `receipt_${Date.now()}`
  };

  const order = await razorpay.orders.create(options);

  res.status(200).json({
    success: true,
    order
  });
});

// VERIFY PAYMENT & CREATE ORDER
export const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    shippingAddress
  } = req.body;

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({
      success: false,
      message: "Payment verification failed"
    });
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

  if (!cart || cart.items.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Cart empty"
    });
  }

  let totalPrice = 0;
  const orderItems = [];
  const vendorGroups = {};

  for (const item of cart.items) {
    const product = item.product;

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    if (product.stock < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `${product.name} is out of stock`
      });
    }
  }

  for (const item of cart.items) {
    const product = item.product;

    product.stock -= item.quantity;
    await product.save();

    const itemSnapshot = {
      product: product._id,
      name: product.name,
      quantity: item.quantity,
      price: product.price,
      image: product.images?.[0]?.url || "",
      vendor: product.vendor
    };

    orderItems.push(itemSnapshot);
    totalPrice += product.price * item.quantity;

    const vendorId = product.vendor.toString();

    if (!vendorGroups[vendorId]) {
      vendorGroups[vendorId] = [];
    }

    vendorGroups[vendorId].push(itemSnapshot);
  }

  const trackingId = `TRK${Date.now().toString().slice(-8)}`;

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod: "Razorpay",
    totalPrice,
    paymentInfo: {
      razorpay_order_id,
      razorpay_payment_id
    },
    paymentStatus: "paid",
    paidAt: Date.now(),
    trackingId
  });

  for (const vendorId in vendorGroups) {
    const vendorItems = vendorGroups[vendorId];

    const subtotal = vendorItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    await VendorOrder.create({
      parentOrder: order._id,
      vendor: vendorId,
      customer: req.user._id,
      orderItems: vendorItems.map((item) => ({
        product: item.product,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image
      })),
      shippingAddress,
      paymentMethod: "Razorpay",
      subtotal
    });
  }

  cart.items = [];
  await cart.save();

  try {
    await sendEmail({
      to: req.user.email,
      subject: "🛒 Your Order is Confirmed - Shoppingo",
      html: `
      <div style="background:#f4f6f8;padding:40px 0;font-family:Arial,sans-serif;">
        <table align="center" width="600" style="background:white;border-radius:10px;overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,0.05);">
          
          <tr>
            <td style="background:#f97316;color:white;padding:20px;text-align:center;font-size:24px;font-weight:bold;">
              Shoppingo
            </td>
          </tr>

          <tr>
            <td style="padding:30px;">
              <h2 style="color:#333;">Hey ${req.user.name}, 🎉</h2>

              <p style="color:#555;font-size:16px;">
                Your order has been successfully placed!
              </p>

              <div style="margin:20px 0;padding:15px;background:#f9fafb;border-radius:8px;">
                <p><strong>Order ID:</strong> ${order._id}</p>
                <p><strong>Tracking ID:</strong> ${trackingId}</p>
                <p><strong>Payment:</strong> ${order.paymentMethod}</p>
              </div>

              <h3 style="margin-top:20px;color:#333;">Order Summary</h3>

              ${order.orderItems.map(item => `
                <div style="display:flex;justify-content:space-between;border-bottom:1px solid #eee;padding:10px 0;">
                  <div>
                    <p style="margin:0;font-weight:500;">${item.name}</p>
                    <p style="margin:0;color:#777;font-size:14px;">Qty: ${item.quantity}</p>
                  </div>
                  <p style="margin:0;font-weight:bold;">₹${item.price * item.quantity}</p>
                </div>
              `).join("")}

              <div style="margin-top:15px;text-align:right;">
                <p style="font-size:18px;font-weight:bold;">Total: ₹${order.totalPrice}</p>
              </div>

              <div style="margin-top:20px;">
                <h4 style="margin-bottom:5px;">Shipping Address</h4>
                <p style="margin:0;color:#555;">
                  ${order.shippingAddress.address},<br/>
                  ${order.shippingAddress.city} - ${order.shippingAddress.postalCode},<br/>
                  ${order.shippingAddress.country}
                </p>
              </div>

              <div style="text-align:center;margin-top:30px;">
                <a href="https://shoppingo-orcin.vercel.app/orders"
                  style="
                    display:inline-block;
                    background:#f97316;
                    color:white;
                    padding:12px 25px;
                    border-radius:6px;
                    text-decoration:none;
                    font-weight:bold;
                  ">
                  View Your Orders
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background:#f9fafb;padding:20px;text-align:center;color:#888;font-size:13px;">
              Thanks for shopping with us ❤️ <br>
              © 2026 Shoppingo Marketplace
            </td>
          </tr>

        </table>
      </div>
      `
    });
  } catch (emailError) {
    console.log("ORDER EMAIL ERROR:", emailError);
  }

  res.status(200).json({
    success: true,
    order
  });
});

