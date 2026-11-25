const mongoose = require('mongoose');

const BacklogGameSchema = new mongoose.Schema({
  steamAppId: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  headerImage: {
    type: String,
    default: ''
  },
  shortDescription: {
    type: String,
    default: ''
  },
  genres: {
    type: [String],
    default: []
  },
  categories: {
    type: [String],
    default: []
  },
  releaseYear: {
    type: String,
    default: ''
  },
  metacritic: {
    type: Number,
    default: null
  },
  priceOverview: {
    type: String,
    default: ''
  },
  steamUrl: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Playing Now', 'Up Next', 'Backlog'],
    default: 'Backlog'
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

BacklogGameSchema.index({ userId: 1, steamAppId: 1 }, { unique: true });
BacklogGameSchema.index({ userId: 1, addedAt: -1 });

const BacklogGame = mongoose.model('BacklogGame', BacklogGameSchema, 'backlog_games');

module.exports = BacklogGame;
