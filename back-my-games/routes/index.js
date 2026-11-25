const express = require('express');
const router = express.Router();

// Import route modules
const gamesRoutes = require('./games');
const moviesRoutes = require('./movies');
const backlogRoutes = require('./backlog');
const authRoutes = require('./auth');

// Mount routes
router.use('/games', gamesRoutes);
router.use('/movies', moviesRoutes);
router.use('/backlog', backlogRoutes);
router.use('/auth', authRoutes);

module.exports = router;
