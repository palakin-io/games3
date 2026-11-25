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

const DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const DDG_CACHE_TTL_MS = 10 * 60 * 1000;
const ddgImageCache = new Map();

function getCachedDdgResults(cacheKey) {
  const entry = ddgImageCache.get(cacheKey);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    ddgImageCache.delete(cacheKey);
    return null;
  }
  return entry.results;
}

function setCachedDdgResults(cacheKey, results) {
  if (ddgImageCache.size >= 100) {
    const oldestKey = ddgImageCache.keys().next().value;
    ddgImageCache.delete(oldestKey);
  }
  ddgImageCache.set(cacheKey, {
    results,
    expiresAt: Date.now() + DDG_CACHE_TTL_MS
  });
}

// Helper: Primary keyless search via DuckDuckGo Images (i.js) with in-memory caching
async function searchDuckDuckGoImages(query, startIndex = 1) {
  const pageSize = 12;
  const cacheKey = query.toLowerCase();
  let allResults = getCachedDdgResults(cacheKey);

  if (!allResults) {
    const tokenUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`;
    const tokenRes = await fetch(tokenUrl, {
      signal: AbortSignal.timeout(4000),
      headers: {
        'User-Agent': DEFAULT_USER_AGENT,
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    if (!tokenRes.ok) {
      throw new Error(`DDG token request failed with status ${tokenRes.status}`);
    }

    const html = await tokenRes.text();
    const vqdMatch = html.match(/vqd=['"]?([\d-]+)['"]?/i);
    if (!vqdMatch || !vqdMatch[1]) {
      throw new Error('Could not extract vqd token from DuckDuckGo');
    }

    const vqd = vqdMatch[1];
    const imgUrl = `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}&vqd=${encodeURIComponent(vqd)}&f=,,,,,&p=1`;
    const imgRes = await fetch(imgUrl, {
      signal: AbortSignal.timeout(4000),
      headers: {
        'User-Agent': DEFAULT_USER_AGENT,
        'Accept': 'application/json',
        'Referer': 'https://duckduckgo.com/'
      }
    });

    if (!imgRes.ok) {
      throw new Error(`DDG image request failed with status ${imgRes.status}`);
    }

    const data = await imgRes.json();
    allResults = Array.isArray(data.results) ? data.results : [];
    if (allResults.length > 0) {
      setCachedDdgResults(cacheKey, allResults);
    }
  }

  const offset = Math.max(0, (Number(startIndex) || 1) - 1);
  const sliced = allResults.slice(offset, offset + pageSize);

  const items = sliced
    .filter(item => item && (item.image || item.thumbnail))
    .map(item => ({
      url: item.image || item.thumbnail,
      thumbnailUrl: item.thumbnail || item.image,
      title: item.title || '',
      width: item.width || null,
      height: item.height || null,
      contextLink: item.url || ''
    }));

  const nextStartIndex = offset + pageSize < allResults.length ? offset + pageSize + 1 : null;

  return {
    items,
    nextStartIndex,
    source: 'duckduckgo'
  };
}

// Helper: Keyless fallback #2 via Wikipedia PageImages + Jikan Characters API
async function searchWikiAndJikanImages(query, charName = '') {
  const results = [];

  const wikiPromise = (async () => {
    try {
      const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=8&prop=pageimages&piprop=original|thumbnail&pithumbsize=600&format=json&origin=*`;
      const res = await fetch(wikiUrl, {
        signal: AbortSignal.timeout(4000),
        headers: { 'User-Agent': DEFAULT_USER_AGENT }
      });
      if (!res.ok) return [];
      const data = await res.json();
      const pages = data?.query?.pages ? Object.values(data.query.pages) : [];
      return pages
        .filter(p => p && (p.original?.source || p.thumbnail?.source))
        .map(p => ({
          url: p.original?.source || p.thumbnail?.source,
          thumbnailUrl: p.thumbnail?.source || p.original?.source,
          title: p.title || query,
          width: p.original?.width || p.thumbnail?.width || null,
          height: p.original?.height || p.thumbnail?.height || null,
          contextLink: `https://en.wikipedia.org/?curid=${p.pageid}`
        }));
    } catch (e) {
      return [];
    }
  })();

  const jikanPromise = (async () => {
    try {
      const searchTarget = (charName || query).trim();
      const jikanUrl = `https://api.jikan.moe/v4/characters?q=${encodeURIComponent(searchTarget)}&limit=10&order_by=favorites&sort=desc`;
      const res = await fetch(jikanUrl, {
        signal: AbortSignal.timeout(4000),
        headers: { 'User-Agent': DEFAULT_USER_AGENT }
      });
      if (!res.ok) return [];
      const data = await res.json();
      const chars = Array.isArray(data.data) ? data.data : [];
      return chars
        .filter(c => c?.images?.jpg?.image_url || c?.images?.webp?.image_url)
        .map(c => {
          const img = c.images?.jpg?.image_url || c.images?.webp?.image_url;
          return {
            url: img,
            thumbnailUrl: img,
            title: c.name_kanji ? `${c.name} (${c.name_kanji})` : (c.name || searchTarget),
            width: null,
            height: null,
            contextLink: c.url || ''
          };
        });
    } catch (e) {
      return [];
    }
  })();

  const [wikiItems, jikanItems] = await Promise.all([wikiPromise, jikanPromise]);
  results.push(...wikiItems, ...jikanItems);

  return {
    items: results,
    nextStartIndex: null,
    source: 'fallback'
  };
}

// Search character images (DuckDuckGo Images primary -> Wikipedia/Jikan fallback)
router.get('/characters/images', async (req, res) => {
  try {
    const query = (req.query.q || '').trim();
    const charName = (req.query.character || '').trim();
    const startIndex = Math.max(1, parseInt(req.query.start, 10) || 1);

    if (!query) {
      return res.status(400).json({ message: 'Search query (q) is required' });
    }

    // 1. Try DuckDuckGo keyless web image search
    try {
      const ddgResult = await searchDuckDuckGoImages(query, startIndex);
      if (ddgResult && ddgResult.items.length > 0) {
        return res.json(ddgResult);
      }
    } catch (ddgErr) {
      console.warn('⚠️ DuckDuckGo image search failed, using Wiki/Jikan fallback:', ddgErr.message);
    }

    // 2. Fallback: Wikipedia + Jikan character portraits
    const wikiJikanResult = await searchWikiAndJikanImages(query, charName);
    return res.json(wikiJikanResult);
  } catch (error) {
    console.error('Error searching character images:', error);
    res.status(500).json({ message: 'Failed to search character images' });
  }
});

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

    // If this game was promoted from the "To Play" backlog list, remove it from backlog
    if (req.body.backlogId) {
      try {
        const BacklogGame = require('../models/backlog_game_schema');
        await BacklogGame.findOneAndDelete({ _id: req.body.backlogId, userId: req.user.userId });
      } catch (err) {
        console.error('Error removing promoted game from backlog:', err);
      }
    }

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

    const mongoose = require('mongoose');
    const gameId = req.body._id;
    if (!mongoose.Types.ObjectId.isValid(gameId)) {
      return res.status(400).json({ message: 'Invalid game ID format' });
    }

    const existingGame = await Game.findById(gameId);

    if (!existingGame) {
      return res.status(404).json({ message: 'Game not found' });
    }

    let characters = [];
    let soundtracks = [];

    try {
      characters = typeof req.body.characters === 'string'
        ? JSON.parse(req.body.characters || '[]')
        : (Array.isArray(req.body.characters) ? req.body.characters : []);
      soundtracks = typeof req.body.soundtracks === 'string'
        ? JSON.parse(req.body.soundtracks || '[]')
        : (Array.isArray(req.body.soundtracks) ? req.body.soundtracks : []);
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
        .sort((a, b) => {
          const idxA = parseInt(a.slice(10, -1), 10);
          const idxB = parseInt(b.slice(10, -1), 10);
          return idxA - idxB;
        })
        .map(key => req.body[key]);
    }

    const existingRatings = existingGame.ratings && typeof existingGame.ratings.toObject === 'function'
      ? existingGame.ratings.toObject()
      : (existingGame.ratings || {});

    const gameData = {
      title: req.body.title,
      wallpaper: req.file ? req.file.path : existingGame.wallpaper,
      description: req.body.description,
      genre: req.body.genre,
      subgenres: subgenres,
      characters: characters,
      ratings: { ...existingRatings },
      dateStart: dateStart,
      dateEnd: dateEnd,
      soundtracks: soundtracks,
      trailer_url: req.body.trailer_url,
      wiki_url: req.body.wiki_url,
    };

    // Update individual rating values 
    for (const ratingKey of ['main', 'story', 'ost', 'art', 'gameplay']) {
      const ratingValue = req.body[`ratings.${ratingKey}`]; 
      if (ratingValue !== undefined && ratingValue !== '' && !isNaN(Number(ratingValue))) {
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

    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({
        message: error.name === 'ValidationError' ? 'Validation error' : 'Invalid field format',
        errors: error.errors || error.message
      });
    }

    res.status(500).json({ message: 'Server error' });
  }
});

// Delete game
router.delete('/:gameId', authenticateJWT, async (req, res) => {
  try {
    const gameId = req.params.gameId;
    
    // Validate ObjectId format
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(gameId)) {
      return res.status(400).json({ message: 'Invalid game ID format' });
    }

    const game = await Game.findById(gameId);

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }


    // Verify creator authorization
    if (game.creator && game.creator.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized to delete this game' });
    }

    // Clean up wallpaper asset if needed
    if (game.wallpaper) {
      if (game.wallpaper.includes('cloudinary.com')) {
        const publicId = extractPublicId(game.wallpaper);
        if (publicId) {
          cloudinary.uploader.destroy(publicId, (error, result) => {
            if (error) console.error('Error deleting image from Cloudinary:', error);
            else console.log('Deleted image from Cloudinary on game deletion:', result);
          });
        }
      } else if (game.wallpaper.startsWith('/uploads/') || game.wallpaper.startsWith('uploads/')) {
        const relativePath = game.wallpaper.startsWith('/') ? game.wallpaper.slice(1) : game.wallpaper;
        const filePath = path.join(__dirname, '..', relativePath);
        fs.unlink(filePath, (err) => {
          if (err && err.code !== 'ENOENT') console.error('Error deleting local upload file:', err);
        });
      }
    }

    await Game.findByIdAndDelete(gameId);

    res.json({ message: 'Game deleted successfully' });
  } catch (error) {
    console.error('Error deleting game:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

