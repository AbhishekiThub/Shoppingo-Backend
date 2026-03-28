import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

import {
  generateAccessToken,
  generateRefreshToken
} from "../utils/generateTokens.js";
import sendEmail from "../utils/sendEmail.js";


// REGISTER
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword
  });


  // Send welcome email
await sendEmail({
  to: user.email,
  subject: "🎉 Welcome to Shoppingo!",
  html: `
  <div style="background:#f4f6f8;padding:40px 0;font-family:Arial,sans-serif;">
    
    <table align="center" width="600" style="background:white;border-radius:10px;overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,0.05);">
      
      <!-- HEADER -->
      <tr>
        <td style="background:#f97316;color:white;padding:20px;text-align:center;font-size:24px;font-weight:bold;">
          Shoppingo
        </td>
      </tr>

      <!-- BODY -->
      <tr>
        <td style="padding:30px;text-align:center;">
          
          <h2 style="color:#333;margin-bottom:10px;">
            Welcome ${user.name}! 🎉
          </h2>

          <p style="color:#555;font-size:16px;margin-bottom:20px;">
            Your account has been successfully created.
          </p>

          <p style="color:#555;font-size:16px;margin-bottom:30px;">
            Start exploring thousands of products from trusted vendors.
          </p>

          <!-- CTA BUTTON -->
          <a href="http://localhost:5173"
            style="
              display:inline-block;
              background:#f97316;
              color:white;
              padding:12px 25px;
              border-radius:6px;
              text-decoration:none;
              font-weight:bold;
            ">
            Start Shopping
          </a>

        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td style="background:#f9fafb;padding:20px;text-align:center;color:#888;font-size:13px;">
          Welcome to the Shoppingo family ❤️ <br>
          © 2026 Shoppingo Marketplace
        </td>
      </tr>

    </table>

  </div>
  `
});

  res.status(201).json({
  success: true,
  message: "User registered successfully",
  user: {
    id: user._id,
    name: user.name,
    email: user.email
  }
});
});


// LOGIN
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  res
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // change to true in production
      sameSite: "lax"
    })
    .status(200)
    .json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
});


//LOGOUT
export const logoutUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.refreshToken = null;
    await user.save();
  }

  res
    .clearCookie("refreshToken")
    .status(200)
    .json({
      success: true,
      message: "Logged out successfully"
    });
});


// REFRESH TOKEN
export const refreshAccessToken = asyncHandler(async (req, res) => {

  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  let decoded;

  try {
    decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const user = await User.findById(decoded.id);

  if (!user || user.refreshToken !== refreshToken) {
    throw new ApiError(401, "Refresh token not valid");
  }

  const newAccessToken = generateAccessToken(user._id);

  res.status(200).json({
    success: true,
    accessToken: newAccessToken
  });

});

// GET ME
export const getMe = asyncHandler(async (req, res) => {

  const user = await User.findById(req.user._id).select("-password");

  res.status(200).json({
    success: true,
    user
  });

});
