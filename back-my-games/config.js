require('dotenv').config();

const defaultOrigins = ['http://localhost:5173', 'https://games3.vercel.app'];
const envOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()) 
  : [];

// specific array merge to ensure we always have the defaults
const corsOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

module.exports = {
  port: process.env.PORT || 3000,
  corsOrigin: corsOrigins,
  
  // Cloudinary Configuration
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  }
};
