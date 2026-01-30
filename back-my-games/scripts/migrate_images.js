require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const Game = require('../models/game_schema'); 
const config = require('../config');

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret
});

// Database Connection
// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mygames';
console.log('Attempting to connect to:', MONGODB_URI);

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

async function uploadToCloudinary(filePath) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'my-games-uploads'
    });
    return result.secure_url;
  } catch (error) {
    console.error(`Failed to upload ${filePath}:`, error);
    return null;
  }
}

async function migrateImages() {
  try {
    const games = await Game.find({});
    console.log(`Found ${games.length} games to check.`);

    for (const game of games) {
      let updated = false;

      // Migrate Wallpaper
      if (game.wallpaper && !game.wallpaper.startsWith('http')) {
        const localPath = path.join(__dirname, '..', game.wallpaper);
        if (fs.existsSync(localPath)) {
          console.log(`Uploading wallpaper for ${game.title}...`);
          const url = await uploadToCloudinary(localPath);
          if (url) {
            game.wallpaper = url;
            updated = true;
          }
        } else {
            // try with leading slash removed
            const cleanPath = game.wallpaper.startsWith('/') ? game.wallpaper.substring(1) : game.wallpaper;
            const fullPath = path.join(__dirname, '..', cleanPath);
             if (fs.existsSync(fullPath)) {
                console.log(`Uploading wallpaper for ${game.title} (fixed path)...`);
                const url = await uploadToCloudinary(fullPath);
                if (url) {
                  game.wallpaper = url;
                  updated = true;
                }
             } else {
                 console.warn(`File not found: ${localPath} or ${fullPath}`);
             }
        }
      }

      // Character migration logic removed as per user request (characters are external URLs)

      if (updated) {
        await game.save();
        console.log(`✅ Updated game: ${game.title}`);
      }
    }

    console.log('Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateImages();
