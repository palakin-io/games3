const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const secret = '12340789';

const Game = require('./models/game_schema');
const User = require('./models/user_schema');


const app = express();
const port = process.env.PORT || 3000;
app.use(cors());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection URI
const uri = "mongodb+srv://polakitow:rasalgul32@gamecluster.emb1xpd.mongodb.net/games_db?retryWrites=true&w=majority&appName=GameCluster";
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

// Connect to MongoDB
mongoose.connect(uri, clientOptions)
    .then(() => {
        console.log("You successfully connected to MongoDB!");
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    })
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Authentication Middleware
function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const token = authHeader.split(' ')[1]; // Extract the token from the Bearer header
  
      jwt.verify(token, secret, (err, user) => {
        if (err) {
          return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user; // Attach the user data to the request object for later use
        next(); // Allow the request to proceed to the next middleware or route handler
      });
    } else {
      res.sendStatus(401); // Unauthorized if no token is provided
    }
}

// API Routes
app.get('/api/games/:gameId', async (req, res) => {
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

app.get('/api/games', async (req, res) => {
    try {
        const games = await Game.find().sort({ 'ratings.main': -1 }); // Fetch all games from the database and sort
        res.json(games);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/gamesByUser', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.userId;
        const games = await Game.find({ creator: userId }).sort({ 'ratings.main': -1 });
        res.json(games);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Set up storage for Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Store files in the 'uploads' folder
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Unique filename for each image
    }
});

const upload = multer({ storage: storage });
app.post('/api/games/upload', authenticateJWT, upload.single('wallpaper'), async (req, res) => {
    try {
        console.log('Received game data:', req.body); // Log to check incoming data
        console.log('Received file data:', req.file);
        // Convert date strings to Date objects
        const dateStart = new Date(req.body.dateStart);
        const dateEnd = new Date(req.body.dateEnd);

        // Validate date objects
        if (isNaN(dateStart.getTime()) || isNaN(dateEnd.getTime())) {
            return res.status(400).json({ message: 'Invalid date format. Please use YYYY-MM-DD' });
        }

        let characters = [];
        let soundtracks = [];
        
        try {
            characters = JSON.parse(req.body.characters || '[]'); // Parse with error handling
            soundtracks = JSON.parse(req.body.soundtracks || '[]');
        } catch (error) {
            return res.status(400).json({ message: 'Invalid JSON format for characters or soundtracs' });
        }

        const gameData = {
            title: req.body.title, 
            wallpaper: req.file ? `/uploads/${req.file.filename}` : null, // Use correct path
            description: req.body.description,
            genre: req.body.genre,
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
                gameData.ratings[ratingKey] = parseFloat(req.body[`ratings.${ratingKey}`]) || 0; // Use parseFloat to allow decimals
            } else {
                gameData.ratings[ratingKey] = parseInt(req.body[`ratings.${ratingKey}`], 10) || 0;
            }
        }

        console.log('Game data after parsing:', gameData); // Log the parsed gameData
        
        //Validate fields according to schema
        const newGame = new Game(gameData);
        await newGame.save();

        res.status(201).json({ message: 'Game uploaded successfully', gameId: newGame._id });
    } catch (error) {
        console.error(error);

        // Send specific error message for validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation error', errors: error.errors });
        }

        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/games/:gameId/edit', authenticateJWT, upload.single('wallpaper'), async (req, res) => {
    try {
        console.log('Received game update data:', req.body); // Log to check incoming data
        console.log('Received file update data:', req.file);
        // Convert date strings to Date objects
        const dateStart = new Date(req.body.dateStart);
        const dateEnd = new Date(req.body.dateEnd);

        // Validate date objects:
        if (isNaN(dateStart.getTime()) || isNaN(dateEnd.getTime())) {
          return res.status(400).json({ message: 'Invalid date format. Please use YYYY-MM-DD' });
        }

        const gameId = req.body._id;
        const existingGame = await Game.findById(gameId); // Fetch existing game data
        console.log('game ID: ', gameId);
        console.log('existing game: ', existingGame);

        if (!existingGame) {
            return res.status(404).json({ message: 'Game not found' });
        }
        
        let characters = [];
        let soundtracks = [];

        characters = req.body.characters;
        soundtracks = req.body.soundtracks;

        console.log('characters: ', characters);
        console.log('ost: ', soundtracks);

        const gameData = {
            _id: req.body._id,
            title: req.body.title,
            // If a new wallpaper is uploaded, update the URL, otherwise, keep the old one
            wallpaper: req.file ? `/uploads/${req.file.filename}` : existingGame.wallpaper,
            description: req.body.description,
            genre: req.body.genre,
            characters: characters,
            ratings: existingGame.ratings || {}, // Use existing ratings, or initialize to empty object
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

        console.log('Game data after parsing:', gameData); // Log the parsed gameData

        // Find and update the game using its ID
        const updatedGame = await Game.findByIdAndUpdate(gameId, gameData, { new: true });

        // Delete the old wallpaper image (if a new one was uploaded)
        if (req.file && existingGame.wallpaper) {
            const oldImagePath = path.join(__dirname, existingGame.wallpaper);
            fs.unlink(oldImagePath, (err) => {
                if (err) console.error('Error deleting old image:', err);
            });
        }

        if (!updatedGame) {
            return res.status(404).json({ message: 'Game not found' });
        }

        res.json({ message: 'Game updated successfully', game: updatedGame });
    } catch (error) {
        console.error(error);

        // Send specific error message for validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation error', errors: error.errors });
        }

        res.status(500).json({ message: 'Server error' });
    }
});


// Registration Route
app.post('/api/users/register', upload.none(), async (req, res) => {
    try {
        console.log(req.body);
        const { username, email, password } = req.body;

        console.log('username: ', username);
        console.log('email: ', email);
        console.log('password: ', password);

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const saltRounds = 10; // stronger hashing
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


// Login Route
app.post('/api/users/login', async (req, res) => {
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

        // Create and sign a JWT token
        const token = jwt.sign({ userId: user._id, username: user.username, email: user.email }, secret, { expiresIn: '1h' }); // 1 hour expiration

        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

//refresh token
app.post('/api/auth/refresh', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.userId; 

        const newToken = jwt.sign({ userId }, secret, { expiresIn: '1h' });
        res.json({ token: newToken });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});