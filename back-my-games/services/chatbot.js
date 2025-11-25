const { Wit } = require('node-wit');
const config = require('../config');
const Game = require('../models/game_schema');
const User = require('../models/user_schema');
const Movie = require('../models/movie_schema');

// Initialize Wit.ai client
let witClient = null;

try {
  if (config.witAiToken) {
    witClient = new Wit({ accessToken: config.witAiToken });
    console.log('✅ Wit.ai client initialized successfully');
  } else {
    console.log('⚠️ Wit.ai token not configured, using fallback responses');
  }
} catch (error) {
  console.log('⚠️ Failed to initialize Wit.ai client, using fallback responses');
}

// Gaming site data functions
async function getGameStats() {
  try {
    const totalGames = await Game.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalMovies = await Movie.countDocuments();
    
    return {
      totalGames,
      totalUsers,
      totalMovies
    };
  } catch (error) {
    console.error('Error getting game stats:', error);
    return { totalGames: 0, totalUsers: 0, totalMovies: 0 };
  }
}

async function getTopRatedGames(limit = 5) {
  try {
    const games = await Game.find({ 'ratings.main': { $exists: true, $ne: null } })
      .sort({ 'ratings.main': -1 })
      .limit(limit)
      .select('title ratings.main genre');
    
    return games;
  } catch (error) {
    console.error('Error getting top rated games:', error);
    return [];
  }
}

async function getGamesByGenre(genre) {
  try {
    const games = await Game.find({ 
      $or: [
        { genre: { $regex: genre, $options: 'i' } },
        { subgenres: { $regex: genre, $options: 'i' } }
      ]
    }).select('title genre ratings.main');
    
    return games;
  } catch (error) {
    console.error('Error getting games by genre:', error);
    return [];
  }
}

async function searchGames(query) {
  try {
    const games = await Game.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { genre: { $regex: query, $options: 'i' } }
      ]
    }).select('title genre ratings.main description');
    
    return games;
  } catch (error) {
    console.error('Error searching games:', error);
    return [];
  }
}

async function getUserGameCount(userId) {
  try {
    const count = await Game.countDocuments({ creator: userId });
    return count;
  } catch (error) {
    console.error('Error getting user game count:', error);
    return 0;
  }
}

// Fallback response system
const fallbackResponses = {
  greeting: [
    'Hello! I\'m your gaming assistant. I can help you find games, check ratings, and explore your gaming collection!',
    'Hi there! Ready to discover some amazing games?',
    'Welcome! I can help you with game recommendations, ratings, and your personal collection!'
  ],
  game_recommendation: [
    'I\'d be happy to recommend some games from our collection! What genre interests you? (RPG, Action, Strategy, etc.)',
    'Looking for game suggestions? I can show you top-rated games or search by genre!',
    'I can help you discover new games! What type of games do you enjoy playing?'
  ],
  help: [
    'I can help you with: game recommendations, searching games, checking ratings, finding games by genre, and exploring your collection. What would you like to know?',
    'I\'m your gaming assistant! I can search games, show ratings, recommend by genre, and help with your collection.',
    'Need gaming help? I can find games, show top ratings, search by genre, and more! What can I help you with?'
  ],
  goodbye: [
    'Goodbye! Happy gaming!',
    'See you later! Enjoy exploring your games!',
    'Take care! Have fun with your gaming collection!'
  ]
};

// Generate chatbot response
async function generateChatbotResponse(message) {
  try {
    // Try Wit.ai first if available
    if (witClient) {
      const result = await witClient.message(message, {});
      console.log('Wit.ai response:', JSON.stringify(result, null, 2));
      
      // Check if we have any intents
      if (result.intents && result.intents.length > 0) {
        const intent = result.intents[0].name;
        const confidence = result.intents[0].confidence;
        const entities = result.entities;
        
        console.log(`✅ Wit.ai detected intent: "${intent}" (confidence: ${confidence})`);
        const response = await generateResponseFromIntent(intent, entities, message);
        console.log(`🎯 Generated response: "${response}"`);
        return response;
      } else {
        console.log('⚠️ Wit.ai returned no intents, falling back to keyword matching');
        return generateFallbackResponse(message);
      }
    }
  } catch (error) {
    console.error('Wit.ai error:', error);
  }
  
  // Fallback to keyword-based responses
  return generateFallbackResponse(message);
}

// Generate response based on Wit.ai intent
async function generateResponseFromIntent(intent, entities, originalMessage) {
  const message = originalMessage.toLowerCase();
  
  switch (intent) {
    case 'greeting':
      return getRandomResponse('greeting');
    
    case 'game_recommendation':
      return await generateGameRecommendationResponse(entities, originalMessage);
    
    case 'game_search':
      return await generateGameSearchResponse(entities, originalMessage);
    
    case 'help':
      return getRandomResponse('help');
    
    case 'goodbye':
      return getRandomResponse('goodbye');
    
    // Gaming site specific intents
    case 'wit$get_top_games':
      return await generateTopGamesResponse();
    case 'wit$get_game_stats':
      return await generateGameStatsResponse();
    case 'wit$search_games':
      return await generateGameSearchResponse(entities, originalMessage);
    case 'wit$get_games_by_genre':
      return await generateGenreGamesResponse(entities, originalMessage);
    
    default:
      return generateFallbackResponse(originalMessage);
  }
}

// Gaming response functions using site data
async function generateTopGamesResponse() {
  try {
    const topGames = await getTopRatedGames(5);
    
    if (topGames.length === 0) {
      return 'No games with ratings found in the collection yet. Be the first to rate a game! 🎮';
    }
    
    let response = '🏆 **Top Rated Games in Our Collection:**\n\n';
    topGames.forEach((game, index) => {
      response += `${index + 1}. **${game.title}** - ${game.ratings.main}/10 (${game.genre})\n`;
    });
    
    return response;
  } catch (error) {
    console.error('Error in generateTopGamesResponse:', error);
    return 'I had trouble getting the top games. Try again later! 🎮';
  }
}

async function generateGameStatsResponse() {
  try {
    const stats = await getGameStats();
    
    return `📊 **Gaming Collection Stats:**\n\n` +
           `🎮 Total Games: ${stats.totalGames}\n` +
           `👥 Total Users: ${stats.totalUsers}\n` +
           `🎬 Total Movies: ${stats.totalMovies}\n\n` +
           `Our community is growing! Join us in building the ultimate gaming collection! 🚀`;
  } catch (error) {
    console.error('Error in generateGameStatsResponse:', error);
    return 'I had trouble getting the stats. Try again later! 🎮';
  }
}

async function generateGameSearchResponse(entities, originalMessage) {
  try {
    // Extract search query from entities or original message
    let searchQuery = '';
    
    if (entities && entities['wit$search_query:search_query']) {
      searchQuery = entities['wit$search_query:search_query'][0].value || entities['wit$search_query:search_query'][0].body;
    } else {
      // Fallback: extract from original message
      searchQuery = originalMessage.replace(/search|find|look for|show me/i, '').trim();
    }
    
    if (!searchQuery) {
      return 'What game would you like me to search for? Just tell me the name or genre! 🎮';
    }
    
    const games = await searchGames(searchQuery);
    
    if (games.length === 0) {
      return `No games found matching "${searchQuery}". Try a different search term or check out our top-rated games! 🎮`;
    }
    
    let response = `🔍 **Search Results for "${searchQuery}":**\n\n`;
    games.slice(0, 5).forEach((game, index) => {
      const rating = game.ratings.main ? `${game.ratings.main}/10` : 'No rating';
      response += `${index + 1}. **${game.title}** - ${rating} (${game.genre})\n`;
    });
    
    if (games.length > 5) {
      response += `\n... and ${games.length - 5} more games!`;
    }
    
    return response;
  } catch (error) {
    console.error('Error in generateGameSearchResponse:', error);
    return 'I had trouble searching for games. Try again later! 🎮';
  }
}

async function generateGenreGamesResponse(entities, originalMessage) {
  try {
    // Extract genre from entities or original message
    let genre = '';
    
    if (entities && entities['wit$genre:genre']) {
      genre = entities['wit$genre:genre'][0].value || entities['wit$genre:genre'][0].body;
    } else {
      // Fallback: extract from original message
      const genreKeywords = ['rpg', 'action', 'strategy', 'adventure', 'puzzle', 'racing', 'sports', 'simulation', 'horror', 'fighting'];
      for (const keyword of genreKeywords) {
        if (originalMessage.toLowerCase().includes(keyword)) {
          genre = keyword;
          break;
        }
      }
    }
    
    if (!genre) {
      return 'What genre are you interested in? I can show you RPG, Action, Strategy, Adventure, and more! 🎮';
    }
    
    const games = await getGamesByGenre(genre);
    
    if (games.length === 0) {
      return `No ${genre} games found in our collection yet. Be the first to add one! 🎮`;
    }
    
    let response = `🎯 **${genre.toUpperCase()} Games in Our Collection:**\n\n`;
    games.slice(0, 5).forEach((game, index) => {
      const rating = game.ratings.main ? `${game.ratings.main}/10` : 'No rating';
      response += `${index + 1}. **${game.title}** - ${rating}\n`;
    });
    
    if (games.length > 5) {
      response += `\n... and ${games.length - 5} more ${genre} games!`;
    }
    
    return response;
  } catch (error) {
    console.error('Error in generateGenreGamesResponse:', error);
    return 'I had trouble finding games by genre. Try again later! 🎮';
  }
}

async function generateGameRecommendationResponse(entities, originalMessage) {
  try {
    // Check if user mentioned a specific genre
    const genreKeywords = ['rpg', 'action', 'strategy', 'adventure', 'puzzle', 'racing', 'sports', 'simulation', 'horror', 'fighting'];
    let mentionedGenre = '';
    
    for (const keyword of genreKeywords) {
      if (originalMessage.toLowerCase().includes(keyword)) {
        mentionedGenre = keyword;
        break;
      }
    }
    
    if (mentionedGenre) {
      return await generateGenreGamesResponse(entities, originalMessage);
    } else {
      // Show top-rated games as general recommendation
      return await generateTopGamesResponse();
    }
  } catch (error) {
    console.error('Error in generateGameRecommendationResponse:', error);
    return 'I had trouble getting game recommendations. Try asking for a specific genre! 🎮';
  }
}

// Generate fallback response based on keywords
async function generateFallbackResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  console.log('🔍 Using keyword-based response matching');
  
  // Check for greetings
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return getRandomResponse('greeting');
  }
  
  // Check for game recommendations
  if (lowerMessage.includes('recommend') || lowerMessage.includes('suggestion')) {
    return getRandomResponse('game_recommendation');
  }
  
  // Check for help
  if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
    return getRandomResponse('help');
  }
  
  // Check for goodbye
  if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye') || lowerMessage.includes('see you')) {
    return getRandomResponse('goodbye');
  }
  
  // Check for top games / best games
  if (lowerMessage.includes('top') || lowerMessage.includes('best') || lowerMessage.includes('highest rated')) {
    return await generateTopGamesResponse();
  }
  
  // Check for stats
  if (lowerMessage.includes('stats') || lowerMessage.includes('statistics') || lowerMessage.includes('how many')) {
    return await generateGameStatsResponse();
  }
  
  // Check for search
  if (lowerMessage.includes('search') || lowerMessage.includes('find') || lowerMessage.includes('look for')) {
    return await generateGameSearchResponse({}, message);
  }
  
  // Check for specific game types
  if (lowerMessage.includes('rpg') || lowerMessage.includes('role playing')) {
    return await generateGenreGamesResponse({}, 'rpg games');
  } else if (lowerMessage.includes('action')) {
    return await generateGenreGamesResponse({}, 'action games');
  } else if (lowerMessage.includes('strategy')) {
    return await generateGenreGamesResponse({}, 'strategy games');
  } else if (lowerMessage.includes('adventure')) {
    return await generateGenreGamesResponse({}, 'adventure games');
  } else if (lowerMessage.includes('puzzle')) {
    return await generateGenreGamesResponse({}, 'puzzle games');
  } else if (lowerMessage.includes('racing')) {
    return await generateGenreGamesResponse({}, 'racing games');
  } else if (lowerMessage.includes('sports')) {
    return await generateGenreGamesResponse({}, 'sports games');
  } else if (lowerMessage.includes('horror')) {
    return await generateGenreGamesResponse({}, 'horror games');
  }
  
  // Check for game mentions
  if (lowerMessage.includes('game')) {
    return 'I can help you find games, show ratings, search by genre, and more! What would you like to know about our game collection? 🎮';
  }
  
  // Default response
  return 'I\'m not sure I understood that. I can help you with games, ratings, recommendations, and our collection. What would you like to know? 🎮';
}

// Get random response from a category
function getRandomResponse(type) {
  const responses = fallbackResponses[type];
  return responses[Math.floor(Math.random() * responses.length)];
}

module.exports = { generateChatbotResponse };
