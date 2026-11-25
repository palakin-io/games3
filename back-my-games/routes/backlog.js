const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware/auth');
const BacklogGame = require('../models/backlog_game_schema');

// Helper to fetch Steam App Details (description, genres, categories, release year, metacritic)
async function fetchSteamAppDetails(appId) {
  try {
    const url = `https://store.steampowered.com/api/appdetails?appids=${encodeURIComponent(appId)}&l=english&cc=US`;
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    if (!response.ok) return null;

    const data = await response.json();
    const entry = data && data[String(appId)];
    if (!entry || !entry.success || !entry.data) return null;

    const info = entry.data;
    const genres = Array.isArray(info.genres)
      ? info.genres.map(g => g.description).filter(Boolean)
      : [];
    const categories = Array.isArray(info.categories)
      ? info.categories.map(c => c.description).filter(Boolean)
      : [];

    let releaseYear = '';
    if (info.release_date && info.release_date.date) {
      const yearMatch = String(info.release_date.date).match(/\b(19\d{2}|20\d{2})\b/);
      releaseYear = yearMatch ? yearMatch[1] : info.release_date.date;
    }

    let priceOverview = '';
    if (info.is_free) {
      priceOverview = 'Free to Play';
    } else if (info.price_overview && info.price_overview.final_formatted) {
      priceOverview = info.price_overview.final_formatted;
    }

    return {
      title: info.name || '',
      headerImage: info.header_image || `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`,
      shortDescription: info.short_description
        ? info.short_description.replace(/<[^>]*>/g, '').trim()
        : '',
      genres,
      categories,
      releaseYear,
      metacritic: info.metacritic && typeof info.metacritic.score === 'number'
        ? info.metacritic.score
        : null,
      priceOverview,
      steamUrl: `https://store.steampowered.com/app/${appId}`
    };
  } catch (error) {
    console.error('Error fetching Steam app details:', error.message);
    return null;
  }
}

// Search games on Steam Store API
router.get('/steam/search', async (req, res) => {
  try {
    const query = (req.query.q || '').trim();
    if (!query) {
      return res.json([]);
    }

    const url = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(query)}&l=english&cc=US`;
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    if (!response.ok) {
      return res.status(502).json({ message: 'Failed to reach Steam Store API' });
    }

    const data = await response.json();
    const items = Array.isArray(data.items) ? data.items : [];

    const results = items.map(item => {
      let priceOverview = 'Free / TBA';
      if (item.price) {
        if (item.price.final === 0) {
          priceOverview = 'Free';
        } else if (typeof item.price.final === 'number') {
          priceOverview = `$${(item.price.final / 100).toFixed(2)}`;
        }
      }

      const parsedMetacritic = item.metascore ? parseInt(item.metascore, 10) : null;

      return {
        steamAppId: item.id,
        title: item.name,
        headerImage: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${item.id}/header.jpg`,
        tinyImage: item.tiny_image || '',
        metacritic: !isNaN(parsedMetacritic) ? parsedMetacritic : null,
        priceOverview,
        steamUrl: `https://store.steampowered.com/app/${item.id}`
      };
    });

    res.json(results);
  } catch (error) {
    console.error('Error searching Steam:', error);
    res.status(500).json({ message: 'Error searching Steam Store' });
  }
});

// Get full Steam app details for a specific appId
router.get('/steam/details/:appId', async (req, res) => {
  try {
    const details = await fetchSteamAppDetails(req.params.appId);
    if (!details) {
      return res.status(404).json({ message: 'Steam app details not found' });
    }
    res.json(details);
  } catch (error) {
    console.error('Error getting Steam app details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get logged-in user's "To Play" list
router.get('/user', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const backlogGames = await BacklogGame.find({ userId }).sort({ addedAt: -1 });
    res.json(backlogGames);
  } catch (error) {
    console.error('Error fetching user backlog games:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add game to user's "To Play" list
router.post('/add', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { steamAppId, title, headerImage, metacritic, priceOverview, status } = req.body;

    if (!steamAppId || !title) {
      return res.status(400).json({ message: 'steamAppId and title are required' });
    }

    const existing = await BacklogGame.findOne({ userId, steamAppId: Number(steamAppId) });
    if (existing) {
      return res.status(409).json({ message: 'Game is already in your To Play list', game: existing });
    }

    // Fetch enriched details from Steam (description, genres, categories, releaseYear, metacritic)
    const steamDetails = await fetchSteamAppDetails(steamAppId);

    const newBacklogGame = new BacklogGame({
      steamAppId: Number(steamAppId),
      title: (steamDetails && steamDetails.title) || title,
      headerImage: (steamDetails && steamDetails.headerImage) || headerImage || `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${steamAppId}/header.jpg`,
      shortDescription: (steamDetails && steamDetails.shortDescription) || '',
      genres: (steamDetails && steamDetails.genres) || [],
      categories: (steamDetails && steamDetails.categories) || [],
      releaseYear: (steamDetails && steamDetails.releaseYear) || '',
      metacritic: (steamDetails && steamDetails.metacritic !== null) ? steamDetails.metacritic : (metacritic ?? null),
      priceOverview: (steamDetails && steamDetails.priceOverview) || priceOverview || '',
      steamUrl: `https://store.steampowered.com/app/${steamAppId}`,
      status: ['Playing Now', 'Up Next', 'Backlog'].includes(status) ? status : 'Backlog',
      userId
    });

    await newBacklogGame.save();
    res.status(201).json(newBacklogGame);
  } catch (error) {
    console.error('Error adding backlog game:', error);
    res.status(500).json({ message: 'Error saving game to To Play list' });
  }
});

// Update status/priority tag of a game in the "To Play" list
router.put('/:id/status', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status } = req.body;

    if (!['Playing Now', 'Up Next', 'Backlog'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const updated = await BacklogGame.findOneAndUpdate(
      { _id: req.params.id, userId },
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Game not found in your To Play list' });
    }

    res.json(updated);
  } catch (error) {
    console.error('Error updating backlog game status:', error);
    res.status(500).json({ message: 'Error updating status' });
  }
});

// Remove game from "To Play" list
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.userId;
    const deleted = await BacklogGame.findOneAndDelete({ _id: req.params.id, userId });

    if (!deleted) {
      return res.status(404).json({ message: 'Game not found or unauthorized' });
    }

    res.json({ message: 'Game removed from To Play list' });
  } catch (error) {
    console.error('Error deleting backlog game:', error);
    res.status(500).json({ message: 'Error removing game from To Play list' });
  }
});

module.exports = router;
