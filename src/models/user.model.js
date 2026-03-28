import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: 6
  },
  role: {
    type: String,
    enum: ["user", "vendor", "admin"],
    default: "user"
  },
  refreshToken: {
    type: String
  }
}, { timestamps: true });

export default mongoose.model("User", userSchema);