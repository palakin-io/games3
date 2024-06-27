const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true }, 
  password: { type: String, required: true, minlength: 8 },
  date_registered: { type: Date, default: Date.now } 
});

const User = mongoose.model('User', userSchema, 'users');

module.exports = User;