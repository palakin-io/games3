const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware/auth');
const Movie = require('../models/movie_schema');

// Add movie to user's list
router.post('/add', authenticateJWT, async (req, res) => { 
  try {
    const { tmdbId, title, posterPath, score, genreIds } = req.body;

    const newMovie = new Movie({
      tmdbId,
      title,
      posterPath,
      score, 
      genreIds,
      userId: req.user.userId, 
    });

    await newMovie.save();

    res.status(201).json({ message: 'Movie saved successfully' }); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error saving movie' });
  }
});

// Get movies by user
router.get('/user/movies', authenticateJWT, async (req, res) => {
  try {
    const user = req.user.userId;
    const movies = await Movie.find({ userId: user }).sort({ 'score': -1 });
    res.json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete movie
router.delete('/:movieId', authenticateJWT, async (req, res) => {
  try {
    const movieId = req.params.movieId; 
    const userId = req.user.userId;

    const movie = await Movie.findOne({ _id: movieId, userId: userId });
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found or you are not authorized to delete it' });
    }

    await Movie.findByIdAndDelete(movieId);

    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting movie' });
  }
});

module.exports = router;
