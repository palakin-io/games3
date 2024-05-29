const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true 
  },
  wallpaper: {type: String},
  description: String,
  genre: String,
  characters: [{ 
    name: String, 
    picture_url: String,
    _id: false 
  }],
  ratings: {
    main: { 
      type: Number,
      min: 0,  // Ratings should be non-negative
      max: 10  // Assuming a 0-10 rating scale
    },
    story: { type: Number, min: 0, max: 10 },
    ost: { type: Number, min: 0, max: 10 },
    art: { type: Number, min: 0, max: 10 },
    gameplay: { type: Number, min: 0, max: 10 }
  },
  dateStart: Date,  
  dateEnd: Date,  
  soundtracks: [{
    title: String,
    video_url: String,
    _id: false 
  }],
  trailer_url: String,
  wiki_url: String
});

const Game = mongoose.model('Game', gameSchema, 'games');

module.exports = Game; 