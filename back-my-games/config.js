require('dotenv').config();
module.exports = {
  witAiToken: 'S7LCAYDPFWNWIYP5G6XMPYL6VK2VHNOY', // Replace with your actual Wit.ai token
  port: process.env.PORT || 3000,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173', // Your Vue.js dev server or production URL
  
  // Cloudinary Configuration
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  }
};
