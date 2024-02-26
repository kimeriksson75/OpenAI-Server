const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  PORT: process.env.PORT,
  API_VERSION: process.env.API_VERSION,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
};
