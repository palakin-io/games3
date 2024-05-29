const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const Game = require('./models/game_schema'); // Make sure the path is correct


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
        const games = await Game.find(); // Fetch all games from the database
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
app.post('/api/games/upload', upload.single('wallpaper'), async (req, res) => {
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
            wiki_url: req.body.wiki_url
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

app.put('/api/games/:gameId/edit', upload.single('wallpaper'), async (req, res) => {
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