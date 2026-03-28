import dotenv from "dotenv";
dotenv.config(); // load env here because cloudinary is loading before .env is injecting the values

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME); //checking if env variables are loaded
// console.log("API Key:", process.env.CLOUDINARY_API_KEY);