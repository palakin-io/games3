const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { upload } = require('../middleware/upload');
const User = require('../models/user_schema');
const RefreshToken = require('../models/refreshToken');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const secret = '12340789';

// User registration
router.post('/register', upload.none(), async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user object
    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    const { login, password } = req.body;

    // Find the user by either username or email
    const user = await User.findOne({
      $or: [{ username: login }, { email: login }] 
    });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare the provided password with the hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create and sign access and refresh tokens
    const accessToken = jwt.sign({ userId: user._id, username: user.username, email: user.email }, secret, { expiresIn: '15m' });
    const refreshTokenValue = jwt.sign({ userId: user._id }, secret, { expiresIn: '7d' });

    // Store refresh token in DB
    const refreshTokenDoc = new RefreshToken({
      userId: user._id,
      token: refreshTokenValue,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    await refreshTokenDoc.save();

    res.json({ accessToken, refreshToken: refreshTokenValue });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Google Login
router.post('/google-login', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'No token provided' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    
    if (!payload || !payload.email) {
      return res.status(401).json({ message: 'Invalid Google token' });
    }

    const email = payload.email;
    const name = payload.name || payload.email.split('@')[0];

    // Find the user by email
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user. Generate random secure password.
      const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
      // Ensure unique username
      let baseUsername = name.replace(/\s+/g, '').toLowerCase();
      let uniqueUsername = baseUsername;
      let count = 1;
      while (await User.findOne({ username: uniqueUsername })) {
        uniqueUsername = `${baseUsername}${count}`;
        count++;
      }

      user = new User({
        username: uniqueUsername,
        email: email,
        password: hashedPassword
      });
      await user.save();
    }

    // Generate tokens
    const accessToken = jwt.sign({ userId: user._id, username: user.username, email: user.email }, secret, { expiresIn: '15m' });
    const refreshTokenValue = jwt.sign({ userId: user._id }, secret, { expiresIn: '7d' });

    // Store refresh token in DB
    const refreshTokenDoc = new RefreshToken({
      userId: user._id,
      token: refreshTokenValue,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    await refreshTokenDoc.save();

    res.json({ accessToken, refreshToken: refreshTokenValue });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Google login failed' });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token required' });
    }
    
    // Verify refresh token
    let payload;
    try {
      payload = jwt.verify(refreshToken, secret);
    } catch (err) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }
    
    // Check if refresh token exists in DB and is not expired
    const tokenDoc = await RefreshToken.findOne({ token: refreshToken, userId: payload.userId });
    if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
      return res.status(403).json({ message: 'Refresh token expired or not found' });
    }
    
    // Issue new access token
    const user = await User.findById(payload.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const newAccessToken = jwt.sign({ userId: user._id, username: user.username, email: user.email }, secret, { expiresIn: '15m' });
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
