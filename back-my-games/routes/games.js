const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const config = require('../config');

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret
});

// Helper to extract public ID from Cloudinary URL
function extractPublicId(url) {
  try {
    const parts = url.split('/');
    const filenameWithExtension = parts.pop();
    const folder = parts.pop(); // Assuming structure .../folder/filename.ext
    const publicIdWithExtension = `${folder}/${filenameWithExtension}`;
    const publicId = publicIdWithExtension.split('.').slice(0, -1).join('.');
    return publicId;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
}
const { authenticateJWT } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const Game = require('../models/game_schema');
const fs = require('fs');
const path = require('path');

// Get game by ID
router.get('/:gameId', async (req, res) => {
  try {
    const gameId = req.params.gameId;
    const game = await Game.findById(gameId);

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    res.json(game);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all games
router.get('/', async (req, res) => {
  try {
    const games = await Game.find().sort({ 'ratings.main': -1 });
    res.json(games);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get games by user
router.get('/user/games', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const games = await Game.find({ creator: userId }).sort({ 'ratings.main': -1 });
    res.json(games);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload new game
router.post('/upload', authenticateJWT, upload.single('wallpaper'), async (req, res) => {
  try {
    const dateStart = new Date(req.body.dateStart);
    const dateEnd = new Date(req.body.dateEnd);

    if (isNaN(dateStart.getTime()) || isNaN(dateEnd.getTime())) {
      return res.status(400).json({ message: 'Invalid date format. Please use YYYY-MM-DD' });
    }

    let characters = [];
    let soundtracks = [];
    
    try {
      characters = JSON.parse(req.body.characters || '[]');
      soundtracks = JSON.parse(req.body.soundtracks || '[]');
    } catch (error) {
      return res.status(400).json({ message: 'Invalid JSON format for characters or soundtracks' });
    }

    // Parse subgenres as array
    let subgenres = [];
    if (Array.isArray(req.body['subgenres[]'])) {
      subgenres = req.body['subgenres[]'];
    } else if (req.body.subgenres) {
      if (Array.isArray(req.body.subgenres)) {
        subgenres = req.body.subgenres;
      } else if (typeof req.body.subgenres === 'string') {
        subgenres = [req.body.subgenres];
      }
    } else {
      subgenres = Object.keys(req.body)
        .filter(key => key.startsWith('subgenres['))
        .sort()
        .map(key => req.body[key]);
    }

    const gameData = {
      title: req.body.title, 
      wallpaper: req.file ? req.file.path : null,
      description: req.body.description,
      genre: req.body.genre,
      subgenres: subgenres,
      characters: characters,
      ratings: {},
      dateStart: dateStart,
      dateEnd: dateEnd,
      soundtracks: soundtracks,
      trailer_url: req.body.trailer_url,
      wiki_url: req.body.wiki_url,
      creator: req.user.userId
    };

    // Extract individual rating values from req.body
    for (const ratingKey of ['main', 'story', 'ost', 'art', 'gameplay']) {
      if (ratingKey == 'main') {
        gameData.ratings[ratingKey] = parseFloat(req.body[`ratings.${ratingKey}`]) || 0;
      } else {
        gameData.ratings[ratingKey] = parseInt(req.body[`ratings.${ratingKey}`], 10) || 0;
      }
    }
    
    const newGame = new Game(gameData);
    await newGame.save();

    res.status(201).json({ message: 'Game uploaded successfully', gameId: newGame._id });
  } catch (error) {
    console.error(error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }

    res.status(500).json({ message: 'Server error' });
  }
});

// Edit game
router.put('/edit', authenticateJWT, upload.single('wallpaper'), async (req, res) => {
  try {
    const dateStart = new Date(req.body.dateStart);
    const dateEnd = new Date(req.body.dateEnd);

    if (isNaN(dateStart.getTime()) || isNaN(dateEnd.getTime())) {
      return res.status(400).json({ message: 'Invalid date format. Please use YYYY-MM-DD' });
    }

    const gameId = req.body._id;
    const existingGame = await Game.findById(gameId);

    if (!existingGame) {
      return res.status(404).json({ message: 'Game not found' });
    }
    
    let characters = [];
    let soundtracks = [];

    characters = req.body.characters;
    soundtracks = req.body.soundtracks;

    // Parse subgenres as array
    let subgenres = [];
    if (Array.isArray(req.body['subgenres[]'])) {
      subgenres = req.body['subgenres[]'];
    } else if (req.body.subgenres) {
      if (Array.isArray(req.body.subgenres)) {
        subgenres = req.body.subgenres;
      } else if (typeof req.body.subgenres === 'string') {
        subgenres = [req.body.subgenres];
      }
    } else {
      subgenres = Object.keys(req.body)
        .filter(key => key.startsWith('subgenres['))
        .sort()
        .map(key => req.body[key]);
    }

    const gameData = {
      _id: req.body._id,
      title: req.body.title,
      wallpaper: req.file ? req.file.path : existingGame.wallpaper,
      description: req.body.description,
      genre: req.body.genre,
      subgenres: subgenres,
      characters: characters,
      ratings: existingGame.ratings || {},
      dateStart: dateStart,
      dateEnd: dateEnd,
      soundtracks: soundtracks,
      trailer_url: req.body.trailer_url,
      wiki_url: req.body.wiki_url,
    };

    // Update individual rating values 
    for (const ratingKey of ['main', 'story', 'ost', 'art', 'gameplay']) {
      const ratingValue = req.body[`ratings.${ratingKey}`]; 
      if (ratingValue !== undefined && !isNaN(ratingValue)) {
        gameData.ratings[ratingKey] = ratingKey === 'main'
          ? parseFloat(ratingValue)
          : parseInt(ratingValue, 10);
      }
    }

    const updatedGame = await Game.findByIdAndUpdate(gameId, gameData, { new: true });

    // Delete the old wallpaper image from Cloudinary (if a new one was uploaded)
    if (req.file && existingGame.wallpaper) {
       // Check if it's a Cloudinary URL (basic check)
       if (existingGame.wallpaper.includes('cloudinary.com')) {
          const publicId = extractPublicId(existingGame.wallpaper);
          if (publicId) {
             cloudinary.uploader.destroy(publicId, (error, result) => {
                if (error) console.error('Error deleting old image from Cloudinary:', error);
                else console.log('Deleted old image from Cloudinary:', result);
             });
          }
       }
    }

    if (!updatedGame) {
      return res.status(404).json({ message: 'Game not found' });
    }

    res.json({ message: 'Game updated successfully', game: updatedGame });
  } catch (error) {
    console.error(error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }

    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
