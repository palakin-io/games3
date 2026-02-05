const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

// Import configurations and services
const config = require('./config');
const { connectDB } = require('./config/database');
const routes = require('./routes');
const { setupChatbotSocket } = require('./socket/chatbot');

// Import models (Ensuring schemas are registered)
require('./models/game_schema');
require('./models/movie_schema');
require('./models/user_schema');
require('./models/refreshToken');

const app = express();
const server = http.createServer(app);

/**
 * 1. SOCKET.IO SETUP
 * Configured with the same CORS origins as the Express app.
 */
const io = socketIo(server, {
  cors: {
    origin: config.corsOrigin,
    methods: ["GET", "POST"],
    credentials: true
  }
});

/**
 * 2. MIDDLEWARE STACK
 * Order is critical: Logging -> CORS -> Parsing -> Routes
 */

// Custom Logging for debugging deployments (Vercel/Render)
app.use((req, res, next) => {
  console.log(`📨 Request: ${req.method} ${req.url} | Origin: ${req.headers.origin}`);
  next();
});

// Primary CORS Configuration
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Assets
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/**
 * 3. ROUTES & SOCKET LOGIC
 */

// API Routes
app.use('/api', routes);

// Chatbot Socket Logic
try {
  setupChatbotSocket(io);
} catch (error) {
  console.error('⚠️ Failed to setup Chatbot Socket:', error.message);
}

// Health check endpoint for Render/Uptime Monitoring
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

/**
 * 4. SERVER LIFECYCLE
 */

async function startServer() {
  try {
    // Connect to database before listening
    const dbConnected = await connectDB();
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Exiting...');
      process.exit(1);
    }

    server.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
      console.log(`🌐 CORS enabled for: ${Array.isArray(config.corsOrigin) ? config.corsOrigin.join(', ') : config.corsOrigin}`);
      console.log('✅ All services initialized successfully!');
    });

  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
}

/**
 * 5. GRACEFUL SHUTDOWN
 */
const handleShutdown = (signal) => {
  console.log(`${signal} received, shutting down gracefully...`);
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

// Launch the app
startServer();