const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
    tmdbId: {
        type: Number,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true 
    },
    posterPath: String,
    score: Number,
    genreIds: [Number],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
});

const Movie = mongoose.model('Movie', MovieSchema, 'movies');

module.exports = Movie; 